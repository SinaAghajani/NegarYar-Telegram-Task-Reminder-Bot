const userService = require("../services/user.service");

async function getCurrentUser(ctx) {
  if (!ctx?.from?.id) {
    throw new Error("TELEGRAM_USER_NOT_FOUND");
  }

  return userService.getByTelegramId(ctx.from.id);
}

async function getById(userId) {
  return userService.getById(userId);
}

async function getByTelegramId(telegramId) {
  return userService.getByTelegramId(telegramId);
}

async function updateTimezone(ctx, timezone) {
  if (!ctx?.state?.user?.id) {
    throw new Error("AUTHENTICATED_USER_NOT_FOUND");
  }

  return userService.updateTimezone(ctx.state.user.id, timezone);
}

async function deactivate(ctx) {
  if (!ctx?.state?.user?.id) {
    throw new Error("AUTHENTICATED_USER_NOT_FOUND");
  }

  return userService.deactivate(ctx.state.user.id);
}

async function activate(ctx) {
  if (!ctx?.state?.user?.id) {
    throw new Error("AUTHENTICATED_USER_NOT_FOUND");
  }

  return userService.activate(ctx.state.user.id);
}

module.exports = Object.freeze({
  getCurrentUser,
  getById,
  getByTelegramId,
  updateTimezone,
  deactivate,
  activate,
});
