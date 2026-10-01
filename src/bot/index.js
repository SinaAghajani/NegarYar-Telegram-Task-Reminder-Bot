const { Telegraf, session, Scenes } = require("telegraf");
const config = require("../config/env");
const logger = require("../config/logger");

const startCommand = require("./commands/start");
const helpCommand = require("./commands/help");
const tasksCommand = require("./commands/tasks");
const cancelCommand = require("./commands/cancel");

const callbackHandler = require("./handlers/callback.handler");
const messageHandler = require("./handlers/message.handler");
const errorHandler = require("./handlers/error.handler");

const taskScene = require("./scenes/task.scene");
const taskEditScene = require("./scenes/task.edit.scene");

const authMiddleware = require("../middleware/auth.middleware");
const rateLimitMiddleware = require("../middleware/rate-limit.middleware");
const { startReminderWorker } = require("../workers/reminder.worker");

function createBot() {
  const bot = new Telegraf(config.botToken);

  const stage = new Scenes.Stage([taskScene, taskEditScene], {
    ttl: 60 * 60,
  });

  bot.use(session());

  bot.use(async (ctx, next) => {
    logger.info(
      {
        updateId: ctx.update?.update_id,
        telegramId: ctx.from?.id,
        username: ctx.from?.username,
        text: ctx.message?.text,
      },
      "Telegram update received",
    );

    return next();
  });

  const rateLimit = rateLimitMiddleware({
    windowMs: 60 * 1000,
    max: 30,
  });

  bot.use(async (ctx, next) => {
    if (!ctx.from) {
      return next();
    }

    return rateLimit(ctx, next);
  });

  bot.use(async (ctx, next) => {
    if (!ctx.from) {
      return next();
    }

    return authMiddleware(ctx, next);
  });

  bot.use(stage.middleware());

  bot.start(startCommand);

  bot.help(helpCommand);

  bot.command("tasks", tasksCommand);
  bot.command("cancel", cancelCommand);

  bot.on("callback_query", callbackHandler);
  bot.on("text", messageHandler);

  bot.catch(errorHandler);

  bot.telegram
    .setMyCommands([
      {
        command: "start",
        description: "شروع کار با نگاریار",
      },
      {
        command: "tasks",
        description: "نمایش کارهای من",
      },
      {
        command: "help",
        description: "راهنمای استفاده",
      },
      {
        command: "cancel",
        description: "لغو عملیات جاری",
      },
    ])
    .catch((error) => {
      logger.error(
        {
          error: {
            message: error.message,
            code: error.code,
            response: error.response,
          },
        },
        "Failed to register bot commands",
      );
    });

  bot.startReminderWorker = () => {
    return startReminderWorker(bot);
  };

  return bot;
}

module.exports = {
  createBot,
};
