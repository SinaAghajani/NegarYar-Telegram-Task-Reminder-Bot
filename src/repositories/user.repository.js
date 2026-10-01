const { pool } = require("../config/database");

async function findById(id, connection = pool) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        telegram_id,
        username,
        first_name,
        last_name,
        language_code,
        timezone,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByTelegramId(telegramId, connection = pool) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        telegram_id,
        username,
        first_name,
        last_name,
        language_code,
        timezone,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE telegram_id = ?
      LIMIT 1
    `,
    [telegramId],
  );

  return rows[0] || null;
}

async function create(user, connection = pool) {
  const [result] = await connection.execute(
    `
      INSERT INTO users (
        telegram_id,
        username,
        first_name,
        last_name,
        language_code,
        timezone
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      user.telegramId,
      user.username,
      user.firstName,
      user.lastName,
      user.languageCode,
      user.timezone,
    ],
  );

  return result.insertId;
}

async function updateByTelegramId(telegramId, user, connection = pool) {
  await connection.execute(
    `
      UPDATE users
      SET
        username = ?,
        first_name = ?,
        last_name = ?,
        language_code = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE telegram_id = ?
    `,
    [
      user.username,
      user.firstName,
      user.lastName,
      user.languageCode,
      telegramId,
    ],
  );
}

async function updateTimezone(userId, timezone, connection = pool) {
  await connection.execute(
    `
      UPDATE users
      SET
        timezone = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [timezone, userId],
  );
}

async function setActive(userId, isActive, connection = pool) {
  await connection.execute(
    `
      UPDATE users
      SET
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [Boolean(isActive), userId],
  );
}

module.exports = {
  findById,
  findByTelegramId,
  create,
  updateByTelegramId,
  updateTimezone,
  setActive,
};
