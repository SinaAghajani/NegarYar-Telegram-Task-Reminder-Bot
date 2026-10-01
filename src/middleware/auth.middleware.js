const userService = require("../services/user.service");
const logger = require("../config/logger");

async function authMiddleware(ctx, next) {
  if (!ctx.from) {
    return next();
  }

  try {
    logger.info(
      {
        telegramId: ctx.from.id,
      },
      "Authenticating Telegram user",
    );

    const user = await userService.getOrCreateUser(ctx.from);

    ctx.state.user = user;

    logger.info(
      {
        telegramId: ctx.from.id,
        userId: user.id,
      },
      "Telegram user authenticated",
    );

    return next();
  } catch (error) {
    logger.error(
      {
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
        telegramId: ctx.from?.id,
      },
      "Authentication failed",
    );

    throw error;
  }
}

module.exports = authMiddleware;
