const logger = require("../config/logger");
const { formatForUser } = require("../utils/date.util");

const REMINDER_LABELS = Object.freeze({
  "24h": "۲۴ ساعت قبل",
  "12h": "۱۲ ساعت قبل",
  "1h": "۱ ساعت قبل",
  "30m": "۳۰ دقیقه قبل",
  "5m": "۵ دقیقه قبل",
});

async function sendReminder(bot, reminder) {
  const timezone = reminder.timezone || "Asia/Tehran";

  const scheduledAt = formatForUser(reminder.scheduled_at, timezone);

  const reminderLabel =
    REMINDER_LABELS[reminder.reminder_type] || reminder.reminder_type;

  const message = [
    "🔔 یادآوری نگاریار",
    "",
    `📌 ${reminder.title}`,
    "",
    `⏰ زمان انجام: ${scheduledAt}`,
    "",
    `🔔 زمان یادآوری: ${reminderLabel}`,
  ].join("\n");

  await bot.telegram.sendMessage(reminder.telegram_id, message);

  logger.info(
    {
      reminderId: reminder.id,
      taskId: reminder.task_id,
      telegramId: reminder.telegram_id,
      reminderType: reminder.reminder_type,
    },
    "Reminder sent",
  );
}

async function sendMessage(bot, telegramId, message, options = {}) {
  return bot.telegram.sendMessage(telegramId, message, options);
}

module.exports = {
  sendReminder,
  sendMessage,
};
