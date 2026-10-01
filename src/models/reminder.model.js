const ReminderModel = Object.freeze({
  tableName: "reminders",

  types: Object.freeze({
    DAY_BEFORE: "24h",
    TWELVE_HOURS: "12h",
    ONE_HOUR: "1h",
    THIRTY_MINUTES: "30m",
    FIVE_MINUTES: "5m",
  }),

  fields: Object.freeze([
    "id",
    "task_id",
    "reminder_type",
    "remind_at",
    "sent",
    "sent_at",
    "created_at",
  ]),

  create(data) {
    return {
      taskId: Number(data.taskId),
      reminderType: data.reminderType,
      remindAt: data.remindAt,
      sent: Boolean(data.sent),
    };
  },
});

module.exports = ReminderModel;
