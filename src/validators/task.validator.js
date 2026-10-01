const { LIMITS } = require("../utils/constants");

const { isNonEmptyString } = require("../utils/validation.util");

const { fromMySQL } = require("../utils/date.util");

function validateTaskTitle(title) {
  if (!isNonEmptyString(title)) {
    throw new Error("INVALID_TASK_TITLE");
  }

  const normalized = title.trim();

  if (normalized.length < LIMITS.TASK_TITLE_MIN) {
    throw new Error("INVALID_TASK_TITLE");
  }

  if (normalized.length > LIMITS.TASK_TITLE_MAX) {
    throw new Error("TASK_TITLE_TOO_LONG");
  }

  return true;
}

function validateTaskDescription(description) {
  if (
    description !== null &&
    description !== undefined &&
    typeof description !== "string"
  ) {
    throw new Error("INVALID_TASK_DESCRIPTION");
  }

  if (
    typeof description === "string" &&
    description.length > LIMITS.TASK_DESCRIPTION_MAX
  ) {
    throw new Error("TASK_DESCRIPTION_TOO_LONG");
  }

  return true;
}

function validateTaskDateTime(scheduledAt) {
  if (!scheduledAt) {
    throw new Error("INVALID_TASK_DATE_TIME");
  }

  const parsed =
    scheduledAt instanceof Object && scheduledAt.isValid
      ? scheduledAt
      : fromMySQL(scheduledAt);

  if (!parsed.isValid) {
    throw new Error("INVALID_TASK_DATE_TIME");
  }

  return true;
}

module.exports = {
  validateTaskTitle,
  validateTaskDescription,
  validateTaskDateTime,
};
