const { Markup } = require("telegraf");

function taskActions(taskId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ انجام شد", `task:complete:${taskId}`),
      Markup.button.callback("❌ لغو", `task:cancel:${taskId}`),
    ],
    [Markup.button.callback("🗑 حذف", `task:delete:${taskId}`)],
  ]);
}

function backToToday() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔙 برنامه امروز", "today:list")],
  ]);
}

module.exports = {
  taskActions,
  backToToday,
};
