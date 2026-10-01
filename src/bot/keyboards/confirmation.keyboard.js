const { Markup } = require("telegraf");

module.exports = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ ثبت کار", "task:confirm"),
      Markup.button.callback("❌ لغو", "task:cancel-create"),
    ],
  ]);
