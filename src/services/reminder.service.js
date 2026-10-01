const { pool } = require("../config/database");
const reminderRepository = require("../repositories/reminder.repository");
const taskRepository = require("../repositories/task.repository");
const { REMINDER_OFFSETS } = require("../utils/constants");
const { toMySQL, fromMySQL } = require("../utils/date.util");

function buildReminders(taskId, scheduledAt) {
  const scheduled = fromMySQL(scheduledAt);

  return Object.entries(REMINDER_OFFSETS).map(([type, offset]) => ({
    taskId,
    reminderType: type,
    remindAt: toMySQL(
      scheduled.minus({
        milliseconds: offset,
      }),
    ),
    sent: false,
  }));
}

async function createForTask(taskId, scheduledAt, connection = pool) {
  const reminders = buildReminders(taskId, scheduledAt);

  await reminderRepository.createMany(reminders, connection);

  return reminders;
}

async function regenerateForTask(taskId, scheduledAt, connection = pool) {
  await reminderRepository.resetForTask(taskId, connection);

  return createForTask(taskId, scheduledAt, connection);
}

async function getTaskReminders(taskId) {
  return reminderRepository.findByTaskId(taskId);
}

async function getDueReminders(limit = 100) {
  return reminderRepository.findDue(limit);
}

async function markAsSent(reminderId) {
  return reminderRepository.markAsSent(reminderId);
}

async function cancelTaskReminders(taskId, connection = pool) {
  await reminderRepository.deleteByTaskId(taskId, connection);
}

async function getTaskWithReminders(taskId) {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    return null;
  }

  const reminders = await reminderRepository.findByTaskId(taskId);

  return {
    task,
    reminders,
  };
}

module.exports = {
  buildReminders,
  createForTask,
  regenerateForTask,
  getTaskReminders,
  getDueReminders,
  markAsSent,
  cancelTaskReminders,
  getTaskWithReminders,
};
