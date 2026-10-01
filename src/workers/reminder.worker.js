const reminderService = require("../services/reminder.service");
const telegramService = require("../services/telegram.service");
const logger = require("../config/logger");

let running = false;

async function processReminders(bot) {
  if (running) {
    return;
  }

  running = true;

  try {
    const reminders = await reminderService.getDueReminders(100);

    for (const reminder of reminders) {
      try {
        const sent = await reminderService.markAsSent(reminder.id);

        if (!sent) {
          continue;
        }

        try {
          await telegramService.sendReminder(bot, reminder);
        } catch (telegramError) {
          logger.error(
            {
              error: telegramError,
              reminderId: reminder.id,
            },
            "Telegram reminder delivery failed",
          );
        }
      } catch (error) {
        logger.error(
          {
            error,
            reminderId: reminder.id,
          },
          "Reminder processing failed",
        );
      }
    }
  } finally {
    running = false;
  }
}

function startReminderWorker(bot) {
  const interval = setInterval(() => {
    processReminders(bot).catch((error) => {
      logger.error(error, "Reminder worker failed");
    });
  }, 30 * 1000);

  processReminders(bot).catch((error) => {
    logger.error(error, "Initial reminder worker failed");
  });

  return () => {
    clearInterval(interval);
  };
}

module.exports = {
  processReminders,
  startReminderWorker,
};
