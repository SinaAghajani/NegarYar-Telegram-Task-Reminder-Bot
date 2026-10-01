const { Markup } = require("telegraf");

function settingsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🌍 منطقه زمانی", "settings:timezone")],
    [Markup.button.callback("🔔 تنظیمات یادآوری", "settings:reminders")],
    [Markup.button.callback("👤 اطلاعات حساب", "settings:account")],
    [Markup.button.callback("🔙 بازگشت", "settings:back")],
  ]);
}

function timezoneKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🇮🇷 تهران", "timezone:Asia/Tehran")],
    [Markup.button.callback("🇪🇸 مادرید", "timezone:Europe/Madrid")],
    [Markup.button.callback("🇬🇧 لندن", "timezone:Europe/London")],
    [Markup.button.callback("🌐 UTC", "timezone:UTC")],
    [Markup.button.callback("🔙 بازگشت", "settings:menu")],
  ]);
}

function remindersKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔙 بازگشت", "settings:menu")],
  ]);
}

function accountKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔙 بازگشت", "settings:menu")],
  ]);
}

module.exports = {
  settingsKeyboard,
  timezoneKeyboard,
  remindersKeyboard,
  accountKeyboard,
};
