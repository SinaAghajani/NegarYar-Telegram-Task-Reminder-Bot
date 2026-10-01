const { Markup } = require("telegraf");

function mainKeyboard() {
  return Markup.keyboard([
    ["➕ افزودن کار"],
    ["📋 کارهای من", "📅 برنامه امروز"],
    ["⚙️ تنظیمات"],
  ])
    .resize()
    .persistent();
}

module.exports = mainKeyboard;
