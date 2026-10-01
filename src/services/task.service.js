const { pool } = require("../config/database");
const { DateTime } = require("luxon");

const taskRepository = require("../repositories/task.repository");
const reminderRepository = require("../repositories/reminder.repository");
const TaskModel = require("../models/task.model");
const reminderService = require("./reminder.service");

const {
  validateTaskTitle,
  validateTaskDateTime,
} = require("../validators/task.validator");

const { toMySQL } = require("../utils/date.util");

function normalizeScheduledAt(value) {
  if (!value) {
    throw new Error("INVALID_DATE_TIME");
  }

  if (typeof value === "string") {
    return value;
  }

  if (value.isValid !== undefined && typeof value.toUTC === "function") {
    return toMySQL(value);
  }

  if (value instanceof Date) {
    return toMySQL(
      DateTime.fromJSDate(value, {
        zone: "utc",
      }),
    );
  }

  throw new Error("INVALID_DATE_TIME");
}

async function createTask(data) {
  validateTaskTitle(data.title);
  validateTaskDateTime(data.scheduledAt);

  const scheduledAt = normalizeScheduledAt(data.scheduledAt);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const task = TaskModel.create({
      ...data,
      scheduledAt,
    });

    const taskId = await taskRepository.create(task, connection);

    await reminderService.createForTask(taskId, task.scheduledAt, connection);

    await connection.commit();

    return taskRepository.findById(taskId, pool);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getTask(taskId, userId) {
  return taskRepository.findByIdAndUserId(taskId, userId);
}

async function getUserTasks(userId, options = {}) {
  return taskRepository.findUserTasks(userId, options);
}

async function getPendingTasks(userId) {
  return taskRepository.findPendingTasks(userId);
}

async function getTodayTasks(userId, timezone = "Asia/Tehran") {
  const current = DateTime.now().setZone(timezone);

  const startOfDay = current.startOf("day");
  const endOfDay = current.endOf("day");

  const from = toMySQL(startOfDay);
  const to = toMySQL(endOfDay);

  return taskRepository.findUserTasks(userId, {
    from,
    to,
    limit: 100,
    offset: 0,
  });
}

async function completeTask(taskId, userId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const task = await taskRepository.findByIdAndUserId(
      taskId,
      userId,
      connection,
    );

    if (!task) {
      throw new Error("TASK_NOT_FOUND");
    }

    const updated = await taskRepository.complete(taskId, userId, connection);

    if (!updated) {
      throw new Error("TASK_ALREADY_FINISHED");
    }

    await reminderRepository.deleteByTaskId(taskId, connection);

    await connection.commit();

    return taskRepository.findById(taskId, pool);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function cancelTask(taskId, userId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const task = await taskRepository.findByIdAndUserId(
      taskId,
      userId,
      connection,
    );

    if (!task) {
      throw new Error("TASK_NOT_FOUND");
    }

    const updated = await taskRepository.cancel(taskId, userId, connection);

    if (!updated) {
      throw new Error("TASK_ALREADY_FINISHED");
    }

    await reminderRepository.deleteByTaskId(taskId, connection);

    await connection.commit();

    return taskRepository.findById(taskId, pool);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteTask(taskId, userId) {
  return taskRepository.deleteById(taskId, userId);
}

async function updateTask(taskId, userId, data) {
  if (data.title !== undefined) {
    validateTaskTitle(data.title);
  }

  if (data.scheduledAt !== undefined) {
    validateTaskDateTime(data.scheduledAt);
  }

  const normalizedData = {
    ...data,
  };

  if (data.scheduledAt !== undefined) {
    normalizedData.scheduledAt = normalizeScheduledAt(data.scheduledAt);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const existingTask = await taskRepository.findByIdAndUserId(
      taskId,
      userId,
      connection,
    );

    if (!existingTask) {
      throw new Error("TASK_NOT_FOUND");
    }

    await taskRepository.update(taskId, userId, normalizedData, connection);

    if (normalizedData.scheduledAt !== undefined) {
      await reminderService.regenerateForTask(
        taskId,
        normalizedData.scheduledAt,
        connection,
      );
    }

    await connection.commit();

    return taskRepository.findById(taskId, pool);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createTask,
  getTask,
  getUserTasks,
  getPendingTasks,
  getTodayTasks,
  completeTask,
  cancelTask,
  deleteTask,
  updateTask,
};
