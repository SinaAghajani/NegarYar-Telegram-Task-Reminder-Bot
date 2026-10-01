const userRepository = require("../repositories/user.repository");
const UserModel = require("../models/user.model");
const config = require("../config/env");

async function getOrCreateUser(telegramUser) {
  const existingUser = await userRepository.findByTelegramId(telegramUser.id);

  if (existingUser) {
    const userData = UserModel.create({
      telegramId: telegramUser.id,
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      languageCode: telegramUser.language_code,
      timezone: existingUser.timezone || config.timezone,
    });

    await userRepository.updateByTelegramId(telegramUser.id, userData);

    return {
      ...existingUser,
      ...userData,
      id: existingUser.id,
      timezone: existingUser.timezone || config.timezone,
    };
  }

  const userData = UserModel.create({
    telegramId: telegramUser.id,
    username: telegramUser.username,
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name,
    languageCode: telegramUser.language_code,
    timezone: config.timezone,
  });

  const id = await userRepository.create(userData);

  return {
    id,
    ...userData,
  };
}

async function getById(userId) {
  return userRepository.findById(userId);
}

async function getByTelegramId(telegramId) {
  return userRepository.findByTelegramId(telegramId);
}

async function updateTimezone(userId, timezone) {
  await userRepository.updateTimezone(userId, timezone);

  return userRepository.findById(userId);
}

async function deactivate(userId) {
  return userRepository.setActive(userId, false);
}

async function activate(userId) {
  return userRepository.setActive(userId, true);
}

module.exports = {
  getOrCreateUser,
  getById,
  getByTelegramId,
  updateTimezone,
  deactivate,
  activate,
};
