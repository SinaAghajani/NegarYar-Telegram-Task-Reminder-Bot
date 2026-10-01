const {
  isPositiveInteger,
  isValidTimezone,
  sanitizeString,
} = require("../utils/validation.util");

function validateTelegramId(telegramId) {
  if (!isPositiveInteger(telegramId)) {
    throw new Error("INVALID_TELEGRAM_ID");
  }

  return true;
}

function validateUsername(username) {
  if (
    username !== null &&
    username !== undefined &&
    typeof username !== "string"
  ) {
    throw new Error("INVALID_USERNAME");
  }

  if (typeof username === "string" && username.length > 255) {
    throw new Error("USERNAME_TOO_LONG");
  }

  return true;
}

function validateTimezone(timezone) {
  if (!isValidTimezone(timezone)) {
    throw new Error("INVALID_TIMEZONE");
  }

  return true;
}

function normalizeUserInput(data) {
  validateTelegramId(data.telegramId);
  validateUsername(data.username);

  const timezone = data.timezone || "Asia/Tehran";

  validateTimezone(timezone);

  return {
    telegramId: Number(data.telegramId),
    username: data.username ? sanitizeString(data.username, 255) : null,
    firstName: data.firstName ? sanitizeString(data.firstName, 255) : null,
    lastName: data.lastName ? sanitizeString(data.lastName, 255) : null,
    languageCode: data.languageCode
      ? sanitizeString(data.languageCode, 20)
      : null,
    timezone,
  };
}

module.exports = {
  validateTelegramId,
  validateUsername,
  validateTimezone,
  normalizeUserInput,
};
