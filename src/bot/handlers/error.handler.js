const logger = require("../../config/logger");

async function errorHandler(error, ctx) {
  logger.error(
    {
      error: {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        errno: error?.errno,
        sqlState: error?.sqlState,
        sqlMessage: error?.sqlMessage,
        stack: error?.stack,
        response: error?.response,
      },
      updateId: ctx.update?.update_id,
      telegramId: ctx.from?.id,
      text: ctx.message?.text,
    },
    "Telegram bot error",
  );

  try {
    if (ctx.chat) {
      await ctx.reply(
        "❌ متأسفانه هنگام پردازش درخواست مشکلی پیش آمد. لطفاً دوباره تلاش کن.",
      );
    }
  } catch (replyError) {
    logger.error(
      {
        error: {
          name: replyError?.name,
          message: replyError?.message,
          code: replyError?.code,
          stack: replyError?.stack,
        },
      },
      "Failed to send error message",
    );
  }
}

module.exports = errorHandler;
