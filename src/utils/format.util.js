const reminderLabels = Object.freeze({
  "24h": "۲۴ ساعت قبل",
  "12h": "۱۲ ساعت قبل",
  "1h": "۱ ساعت قبل",
  "30m": "۳۰ دقیقه قبل",
  "5m": "۵ دقیقه قبل",
});

const statusLabels = Object.freeze({
  pending: "در انتظار",
  completed: "انجام شده",
  cancelled: "لغو شده",
});

function formatReminderType(type) {
  return reminderLabels[type] || type;
}

function formatTaskStatus(status) {
  return statusLabels[status] || status;
}

function formatTask(task) {
  return [
    `📌 ${task.title}`,
    task.description ? `📝 ${task.description}` : null,
    `⏰ ${task.scheduled_at}`,
    `📊 ${formatTaskStatus(task.status)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatReminder(reminder) {
  return [
    "🔔 یادآوری",
    "",
    `📌 ${reminder.title}`,
    `⏰ ${reminder.scheduled_at}`,
    `🔔 ${formatReminderType(reminder.reminder_type)}`,
  ].join("\n");
}

module.exports = {
  formatReminderType,
  formatTaskStatus,
  formatTask,
  formatReminder,
};
