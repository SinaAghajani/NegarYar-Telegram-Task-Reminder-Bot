const taskService = require("../../services/task.service");
const userService = require("../../services/user.service");
const { formatForUser } = require("../../utils/date.util");

const { settingsKeyboard } = require("../keyboards/settings.keyboard");

async function showToday(ctx) {
  const user = ctx.state.user;

  const tasks = await taskService.getTodayTasks(user.id, user.timezone);

  if (!tasks.length) {
    await ctx.reply("📅 برای امروز هیچ کاری ثبت نشده است.");
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
    const scheduledAt = formatForUser(task.scheduled_at, user.timezone);

    const message = [
      `📌 ${task.title}`,
      `⏰ ${scheduledAt}`,
      `📊 وضعیت: ${statusLabels[task.status] || task.status}`,
    ];

    if (task.description) {
      message.push(`📝 ${task.description}`);
    }

    const buttons = [];

    if (task.status === "pending") {
      buttons.push([
        {
          text: "✅ انجام شد",
          callback_data: `task:complete:${task.id}`,
        },
        {
          text: "❌ لغو",
          callback_data: `task:cancel:${task.id}`,
        },
      ]);

      buttons.push([
        {
          text: "🗑 حذف",
          callback_data: `task:delete:${task.id}`,
        },
      ]);
    }

    await ctx.reply(
      message.join("\n"),
      buttons.length
        ? { reply_markup: { inline_keyboard: buttons } }
        : undefined,
    );
  }
}

async function showSettings(ctx) {
  const user = ctx.state.user;

  await ctx.reply(
    [
      "⚙️ تنظیمات نگاریار",
      "",
      `🌍 منطقه زمانی: ${user.timezone}`,
      "",
      "یکی از گزینه‌های زیر را انتخاب کن:",
    ].join("\n"),
    settingsKeyboard(),
  );
}

module.exports = async (ctx) => {
  try {
    const data = ctx.callbackQuery?.data;

    if (!data) {
      await ctx.answerCbQuery();
      return;
    }

    if (data === "task:create") {
      await ctx.answerCbQuery();
      await ctx.scene.enter("task-create");
      return;
    }

    if (data === "task:list") {
      await ctx.answerCbQuery();
      await showToday(ctx);
      return;
    }

    if (data === "today:list") {
      await ctx.answerCbQuery();
      await showToday(ctx);
      return;
    }

    if (data.startsWith("task:edit:")) {
      await ctx.answerCbQuery();

      const taskId = Number(data.split(":")[2]);

      if (!Number.isInteger(taskId)) {
        await ctx.reply("شناسه کار نامعتبر است.");
        return;
      }

      await ctx.scene.enter("task-edit", {
        taskId,
      });

      return;
    }

    if (data.startsWith("task:complete:")) {
      await ctx.answerCbQuery();

      const taskId = Number(data.split(":")[2]);

      if (!Number.isInteger(taskId)) {
        await ctx.reply("شناسه کار نامعتبر است.");
        return;
      }

      try {
        await taskService.completeTask(taskId, ctx.state.user.id);

        await ctx.reply("✅ کار با موفقیت انجام‌شده علامت‌گذاری شد.");
      } catch (error) {
        if (error.message === "TASK_NOT_FOUND") {
          await ctx.reply("❌ این کار پیدا نشد.");
          return;
        }

        if (error.message === "TASK_ALREADY_FINISHED") {
          await ctx.reply("ℹ️ این کار قبلاً تمام شده یا لغو شده است.");
          return;
        }

        throw error;
      }

      return;
    }

    if (data.startsWith("task:cancel:")) {
      await ctx.answerCbQuery();

      const taskId = Number(data.split(":")[2]);

      if (!Number.isInteger(taskId)) {
        await ctx.reply("شناسه کار نامعتبر است.");
        return;
      }

      try {
        await taskService.cancelTask(taskId, ctx.state.user.id);

        await ctx.reply("❌ کار با موفقیت لغو شد.");
      } catch (error) {
        if (error.message === "TASK_NOT_FOUND") {
          await ctx.reply("❌ این کار پیدا نشد.");
          return;
        }

        if (error.message === "TASK_ALREADY_FINISHED") {
          await ctx.reply("ℹ️ این کار قبلاً تمام شده یا لغو شده است.");
          return;
        }

        throw error;
      }

      return;
    }

    if (data.startsWith("task:delete:")) {
      await ctx.answerCbQuery();

      const taskId = Number(data.split(":")[2]);

      if (!Number.isInteger(taskId)) {
        await ctx.reply("شناسه کار نامعتبر است.");
        return;
      }

      const deleted = await taskService.deleteTask(taskId, ctx.state.user.id);

      if (!deleted) {
        await ctx.reply("❌ این کار پیدا نشد.");
        return;
      }

      await ctx.reply("🗑 کار با موفقیت حذف شد.");

      return;
    }

    if (data === "settings:menu") {
      await ctx.answerCbQuery();
      await showSettings(ctx);
      return;
    }

    if (data === "settings:timezone") {
      await ctx.answerCbQuery();

      const { timezoneKeyboard } = require("../keyboards/settings.keyboard");

      await ctx.reply(
        [
          "🌍 منطقه زمانی",
          "",
          `منطقه زمانی فعلی: ${ctx.state.user.timezone}`,
          "",
          "منطقه زمانی موردنظر را انتخاب کن:",
        ].join("\n"),
        timezoneKeyboard(),
      );

      return;
    }

    if (data.startsWith("timezone:")) {
      await ctx.answerCbQuery();

      const timezone = data.substring("timezone:".length);

      const allowedTimezones = [
        "Asia/Tehran",
        "Europe/Madrid",
        "Europe/London",
        "UTC",
      ];

      if (!allowedTimezones.includes(timezone)) {
        await ctx.reply("❌ منطقه زمانی انتخاب‌شده معتبر نیست.");
        return;
      }

      const user = await userService.updateTimezone(
        ctx.state.user.id,
        timezone,
      );

      ctx.state.user = user;

      await ctx.reply(
        [
          "✅ منطقه زمانی با موفقیت تغییر کرد.",
          "",
          `🌍 منطقه زمانی جدید: ${timezone}`,
          "",
          "از این به بعد زمان کارها و یادآوری‌ها بر اساس این منطقه زمانی نمایش داده می‌شود.",
        ].join("\n"),
      );

      return;
    }

    if (data === "settings:reminders") {
      await ctx.answerCbQuery();

      const { remindersKeyboard } = require("../keyboards/settings.keyboard");

      await ctx.reply(
        [
          "🔔 تنظیمات یادآوری",
          "",
          "در حال حاضر ۵ یادآوری برای هر کار فعال است:",
          "",
          "🔔 ۲۴ ساعت قبل",
          "🔔 ۱۲ ساعت قبل",
          "🔔 ۱ ساعت قبل",
          "🔔 ۳۰ دقیقه قبل",
          "🔔 ۵ دقیقه قبل",
          "",
          "مدیریت فعال/غیرفعال کردن هر یادآوری در نسخه بعدی اضافه می‌شود.",
        ].join("\n"),
        remindersKeyboard(),
      );

      return;
    }

    if (data.startsWith("reminder:")) {
      await ctx.answerCbQuery();

      await ctx.reply("ℹ️ تنظیم جداگانه یادآوری‌ها در حال توسعه است.");

      return;
    }

    if (data === "settings:account") {
      await ctx.answerCbQuery();

      const user = ctx.state.user;

      await ctx.reply(
        [
          "👤 اطلاعات حساب",
          "",
          `🆔 شناسه کاربر: ${user.id}`,
          `👤 نام: ${user.firstName || "ثبت نشده"}`,
          `🔹 نام کاربری: ${user.username ? `@${user.username}` : "ثبت نشده"}`,
          `🌍 منطقه زمانی: ${user.timezone}`,
          "",
          `📅 عضویت: ${formatForUser(
            user.createdAt || user.created_at,
            user.timezone,
          )}`,
        ].join("\n"),
      );

      return;
    }

    if (data === "settings:back") {
      await ctx.answerCbQuery();

      await ctx.reply("🔙 به منوی اصلی برگشتی.");

      return;
    }

    if (data === "menu:help") {
      await ctx.answerCbQuery();

      await ctx.reply(
        [
          "📚 راهنمای نگاریار",
          "",
          "➕ برای ثبت کار جدید استفاده کن.",
          "📋 برای مشاهده کارهای فعال.",
          "📅 برای مشاهده برنامه امروز.",
          "⚙️ برای مدیریت تنظیمات.",
          "",
          "هر کار تا ۵ بار یادآوری می‌شود.",
        ].join("\n"),
      );

      return;
    }

    await ctx.answerCbQuery();
  } catch (error) {
    throw error;
  }
};
