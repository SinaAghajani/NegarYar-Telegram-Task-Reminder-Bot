const REMINDER_TYPES = Object.freeze({
  DAY_BEFORE: "24h",
  TWELVE_HOURS: "12h",
  ONE_HOUR: "1h",
  THIRTY_MINUTES: "30m",
  FIVE_MINUTES: "5m",
});

const REMINDER_OFFSETS = Object.freeze({
  "24h": 24 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "5m": 5 * 60 * 1000,
});

const TASK_STATUS = Object.freeze({
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const LIMITS = Object.freeze({
  TASK_TITLE_MIN: 1,
  TASK_TITLE_MAX: 500,
  TASK_DESCRIPTION_MAX: 5000,
  TASK_LIST: 50,
  REMINDER_BATCH: 100,
});

module.exports = {
  REMINDER_TYPES,
  REMINDER_OFFSETS,
  TASK_STATUS,
  LIMITS,
};
