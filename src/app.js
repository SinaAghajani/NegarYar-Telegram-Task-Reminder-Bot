const { createBot } = require("./bot");
const { testConnection, closeConnection } = require("./config/database");
const logger = require("./config/logger");

async function bootstrap() {
  let bot = null;
  let stopWorker = null;
  let isShuttingDown = false;

  try {
    logger.info("Starting NegarYar...");

    await testConnection();

    logger.info("Creating Telegram bot...");

    bot = createBot();

    logger.info("Testing Telegram connection...");

    const telegramInfo = await bot.telegram.getMe();

    logger.info(
      {
        id: telegramInfo.id,
        username: telegramInfo.username,
      },
      "Telegram connection established",
    );

    logger.info("Launching Telegram bot...");

    bot
      .launch({
        dropPendingUpdates: true,
      })
      .catch((error) => {
        logger.error(
          {
            error: {
              message: error.message,
              name: error.name,
              code: error.code,
              response: error.response,
              stack: error.stack,
            },
          },
          "Telegram polling failed",
        );

        process.exit(1);
      });

    logger.info("Telegram launch requested");

    stopWorker = bot.startReminderWorker();

    logger.info("Reminder worker started");
    logger.info("NegarYar started successfully");

    const shutdown = async (signal) => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;

      logger.info({ signal }, "Shutdown signal received");

      try {
        if (stopWorker) {
          stopWorker();
          stopWorker = null;
        }

        if (bot) {
          bot.stop(signal);
        }

        await closeConnection();

        logger.info("NegarYar stopped successfully");

        process.exit(0);
      } catch (error) {
        logger.error(
          {
            error: {
              message: error.message,
              name: error.name,
              stack: error.stack,
            },
          },
          "Shutdown failed",
        );

        process.exit(1);
      }
    };

    process.once("SIGINT", () => {
      shutdown("SIGINT");
    });

    process.once("SIGTERM", () => {
      shutdown("SIGTERM");
    });
  } catch (error) {
    logger.error(
      {
        error: {
          message: error.message,
          name: error.name,
          code: error.code,
          response: error.response,
          stack: error.stack,
        },
      },
      "Failed to start NegarYar",
    );

    if (stopWorker) {
      try {
        stopWorker();
      } catch {}
    }

    if (bot) {
      try {
        bot.stop("startup-error");
      } catch {}
    }

    try {
      await closeConnection();
    } catch {}

    process.exit(1);
  }
}

bootstrap();
