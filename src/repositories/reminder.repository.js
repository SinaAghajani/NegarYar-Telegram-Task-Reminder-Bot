const { pool } = require("../config/database");

async function create(reminder, connection = pool) {
  const [result] = await connection.execute(
    `
      INSERT INTO reminders (
        task_id,
        reminder_type,
        remind_at,
        sent
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      reminder.taskId,
      reminder.reminderType,
      reminder.remindAt,
      reminder.sent ? 1 : 0,
    ],
  );

  return result.insertId;
}

async function createMany(reminders, connection = pool) {
  if (!reminders.length) {
    return;
  }

  const values = reminders.map((reminder) => [
    reminder.taskId,
    reminder.reminderType,
    reminder.remindAt,
    reminder.sent ? 1 : 0,
  ]);

  const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");

  const flattenedValues = values.flat();

  await connection.execute(
    `
      INSERT INTO reminders (
        task_id,
        reminder_type,
        remind_at,
        sent
      )
      VALUES ${placeholders}
    `,
    flattenedValues,
  );
}

async function findById(id, connection = pool) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        task_id,
        reminder_type,
        remind_at,
        sent,
        sent_at,
        created_at
      FROM reminders
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByTaskId(taskId, connection = pool) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        task_id,
        reminder_type,
        remind_at,
        sent,
        sent_at,
        created_at
      FROM reminders
      WHERE task_id = ?
      ORDER BY remind_at ASC
    `,
    [taskId],
  );

  return rows;
}

async function findDue(limit = 100, connection = pool) {
  const [rows] = await connection.execute(
    `
      SELECT
        r.id,
        r.task_id,
        r.reminder_type,
        r.remind_at,
        r.sent,
        t.user_id,
        t.title,
        t.description,
        t.scheduled_at,
        u.telegram_id,
        u.timezone
      FROM reminders r
      INNER JOIN tasks t
        ON t.id = r.task_id
      INNER JOIN users u
        ON u.id = t.user_id
      WHERE r.sent = 0
        AND t.status = 'pending'
        AND u.is_active = 1
        AND t.scheduled_at > UTC_TIMESTAMP()
        AND r.remind_at <= UTC_TIMESTAMP()
        AND r.remind_at >= UTC_TIMESTAMP() - INTERVAL 5 MINUTE
      ORDER BY r.remind_at ASC
      LIMIT ?
    `,
    [Number(limit)],
  );

  return rows;
}

async function markAsSent(reminderId, connection = pool) {
  const [result] = await connection.execute(
    `
      UPDATE reminders
      SET
        sent = 1,
        sent_at = UTC_TIMESTAMP()
      WHERE id = ?
        AND sent = 0
    `,
    [reminderId],
  );

  return result.affectedRows > 0;
}

async function resetForTask(taskId, connection = pool) {
  await connection.execute(
    `
      DELETE FROM reminders
      WHERE task_id = ?
    `,
    [taskId],
  );
}

async function deleteByTaskId(taskId, connection = pool) {
  await connection.execute(
    `
      DELETE FROM reminders
      WHERE task_id = ?
    `,
    [taskId],
  );
}

module.exports = {
  create,
  createMany,
  findById,
  findByTaskId,
  findDue,
  markAsSent,
  resetForTask,
  deleteByTaskId,
};
