const { Markup } = require("telegraf");

const taskService = require("../../services/task.service");
const settingsKeyboard = require("../keyboards/settings.keyboard");

module.exports = async (ctx, next) => {
  const text = ctx.message?.text?.trim();

  if (!text) {
    return next();
  }

  if (text === "➕ افزودن کار") {
    await ctx.scene.enter("task-create");
    return;
  }

  if (text === "📋 کارهای من") {
    await ctx.reply(
      "📋 کارهای من",
      Markup.inlineKeyboard([
        [
          Markup.button.callback("🔄 نمایش کارها", "task:list"),
          Markup.button.callback("➕ افزودن کار", "task:create"),
        ],
      ]),
    );

    return;
  }

  if (text === "📅 برنامه امروز") {
    const user = ctx.state.user;

    const tasks = await taskService.getTodayTasks(user.id, user.timezone);

    if (!tasks.length) {
      await ctx.reply(
        [
          "📅 برنامه امروز",
          "",
          "📭 برای امروز هیچ کاری ثبت نشده است.",
          "",
          "می‌توانی با گزینه «➕ افزودن کار» یک کار جدید ثبت کنی.",
        ].join("\n"),
      );

      return;
    }

    const statusLabels = {
      pending: "⏳ در انتظار",
      completed: "✅ انجام شده",
      cancelled: "❌ لغو شده",
    };

    await ctx.reply(
      ["📅 برنامه امروز", "", `📌 تعداد کارها: ${tasks.length}`].join("\n"),
    );

    for (const task of tasks) {
      const { formatForUser } = require("../../utils/date.util");

      const scheduledAt = formatForUser(task.scheduled_at, user.timezone);

      const status = statusLabels[task.status] || task.status;

      const message = [
        `📌 ${task.title}`,
        `⏰ ${scheduledAt}`,
        `📊 وضعیت: ${status}`,
      ];

      if (task.description) {
        message.push(`📝 ${task.description}`);
      }

      const buttons = [];

      if (task.status === "pending") {
        buttons.push([
          Markup.button.callback("✅ انجام شد", `task:complete:${task.id}`),
          Markup.button.callback("❌ لغو", `task:cancel:${task.id}`),
        ]);

        buttons.push([
          Markup.button.callback("🗑 حذف", `task:delete:${task.id}`),
        ]);
      }

      await ctx.reply(
        message.join("\n"),
        buttons.length ? Markup.inlineKeyboard(buttons) : undefined,
      );
    }

    return;
  }

  if (text === "⚙️ تنظیمات") {
    const user = ctx.state.user;

    await ctx.reply(
      [
        "⚙️ تنظیمات نگاریار",
        "",
        `🌍 منطقه زمانی: ${user.timezone}`,
        "",
        "یکی از گزینه‌های زیر را انتخاب کن:",
      ].join("\n"),
      settingsKeyboard.settingsKeyboard(),
    );

    return;
  }

  if (text === "/cancel") {
    if (ctx.scene?.current) {
      await ctx.scene.leave();
    }

    await ctx.reply("❌ عملیات لغو شد.");
    return;
  }

  return next();
};
