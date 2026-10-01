const { pool } = require("../config/database");

async function findById(id, connection = pool) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        user_id,
        title,
        description,
        scheduled_at,
        status,
        created_at,
        updated_at
      FROM tasks
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByIdAndUserId(taskId, userId, connection = pool) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        user_id,
        title,
        description,
        scheduled_at,
        status,
        created_at,
        updated_at
      FROM tasks
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [taskId, userId],
  );

  return rows[0] || null;
}

async function create(task, connection = pool) {
  const [result] = await connection.execute(
    `
      INSERT INTO tasks (
        user_id,
        title,
        description,
        scheduled_at,
        status
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [task.userId, task.title, task.description, task.scheduledAt, task.status],
  );

  return result.insertId;
}

async function update(taskId, userId, data, connection = pool) {
  const fields = [];
  const values = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }

  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }

  if (data.scheduledAt !== undefined) {
    fields.push("scheduled_at = ?");
    values.push(data.scheduledAt);
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (!fields.length) {
    return false;
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");

  values.push(taskId, userId);

  const [result] = await connection.execute(
    `
      UPDATE tasks
      SET ${fields.join(", ")}
      WHERE id = ?
        AND user_id = ?
    `,
    values,
  );

  return result.affectedRows > 0;
}

async function deleteById(taskId, userId, connection = pool) {
  const [result] = await connection.execute(
    `
      DELETE FROM tasks
      WHERE id = ?
        AND user_id = ?
    `,
    [taskId, userId],
  );

  return result.affectedRows > 0;
}

async function complete(taskId, userId, connection = pool) {
  const [result] = await connection.execute(
    `
      UPDATE tasks
      SET
        status = 'completed',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND user_id = ?
        AND status = 'pending'
    `,
    [taskId, userId],
  );

  return result.affectedRows > 0;
}

async function cancel(taskId, userId, connection = pool) {
  const [result] = await connection.execute(
    `
      UPDATE tasks
      SET
        status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND user_id = ?
        AND status = 'pending'
    `,
    [taskId, userId],
  );

  return result.affectedRows > 0;
}

async function findUserTasks(userId, options = {}, connection = pool) {
  const {
    status = null,
    from = null,
    to = null,
    limit = 50,
    offset = 0,
  } = options;

  const conditions = ["user_id = ?"];
  const values = [userId];

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  if (from) {
    conditions.push("scheduled_at >= ?");
    values.push(from);
  }

  if (to) {
    conditions.push("scheduled_at <= ?");
    values.push(to);
  }

  values.push(Number(limit));
  values.push(Number(offset));

  const [rows] = await connection.execute(
    `
      SELECT
        id,
        user_id,
        title,
        description,
        scheduled_at,
        status,
        created_at,
        updated_at
      FROM tasks
      WHERE ${conditions.join(" AND ")}
      ORDER BY scheduled_at ASC
      LIMIT ?
      OFFSET ?
    `,
    values,
  );

  return rows;
}

async function findPendingTasks(userId, connection = pool) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        user_id,
        title,
        description,
        scheduled_at,
        status,
        created_at,
        updated_at
      FROM tasks
      WHERE user_id = ?
        AND status = 'pending'
      ORDER BY scheduled_at ASC
    `,
    [userId],
  );

  return rows;
}

module.exports = {
  findById,
  findByIdAndUserId,
  create,
  update,
  deleteById,
  complete,
  cancel,
  findUserTasks,
  findPendingTasks,
};
