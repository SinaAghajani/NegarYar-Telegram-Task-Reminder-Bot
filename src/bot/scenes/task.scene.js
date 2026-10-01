const { Scenes } = require("telegraf");
const taskService = require("../../services/task.service");
const taskKeyboard = require("../keyboards/task.keyboard");
const confirmationKeyboard = require("../keyboards/confirmation.keyboard");
const { parseDateTime, formatForUser } = require("../../utils/date.util");

const taskScene = new Scenes.WizardScene(
  "task-create",

  async (ctx) => {
    ctx.wizard.state.task = {};

    await ctx.reply(
      "➕ ثبت کار جدید\n\nلطفاً عنوان کار را وارد کن:",
      taskKeyboard.cancel(),
    );

    return ctx.wizard.next();
  },

  async (ctx) => {
    if (ctx.message?.text === "❌ لغو") {
      await ctx.scene.leave();
      await ctx.reply("❌ ثبت کار لغو شد.");
      return;
    }

    const title = ctx.message?.text?.trim();

    if (!title) {
      await ctx.reply("⚠️ لطفاً عنوان کار را وارد کن.");
      return;
    }

    ctx.wizard.state.task.title = title;

    await ctx.reply(
      [
        "📅 تاریخ انجام کار را وارد کن.",
        "",
        "فرمت:",
        "YYYY/MM/DD",
        "",
        "مثال:",
        "1405/07/15",
      ].join("\n"),
      taskKeyboard.cancel(),
    );

    return ctx.wizard.next();
  },

  async (ctx) => {
    if (ctx.message?.text === "❌ لغو") {
      await ctx.scene.leave();
      await ctx.reply("❌ ثبت کار لغو شد.");
      return;
    }

    const date = ctx.message?.text?.trim();

    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      await ctx.reply("⚠️ تاریخ نامعتبر است. مثال صحیح: 1405/07/15");
      return;
    }

    ctx.wizard.state.task.date = date;

    await ctx.reply(
      [
        "⏰ ساعت انجام کار را وارد کن.",
        "",
        "فرمت:",
        "HH:mm",
        "",
        "مثال:",
        "18:30",
      ].join("\n"),
      taskKeyboard.cancel(),
    );

    return ctx.wizard.next();
  },

  async (ctx) => {
    if (ctx.message?.text === "❌ لغو") {
      await ctx.scene.leave();
      await ctx.reply("❌ ثبت کار لغو شد.");
      return;
    }

    const time = ctx.message?.text?.trim();

    if (!/^\d{2}:\d{2}$/.test(time)) {
      await ctx.reply("⚠️ ساعت نامعتبر است. مثال صحیح: 18:30");
      return;
    }

    ctx.wizard.state.task.time = time;

    await ctx.reply(
      "📝 توضیحات کار را وارد کن یا گزینه «بدون توضیحات» را بزن.",
      taskKeyboard.description(),
    );

    return ctx.wizard.next();
  },

  async (ctx) => {
    if (ctx.message?.text === "❌ لغو") {
      await ctx.scene.leave();
      await ctx.reply("❌ ثبت کار لغو شد.");
      return;
    }

    const description =
      ctx.message?.text === "⏭ بدون توضیحات"
        ? null
        : ctx.message?.text?.trim() || null;

    const state = ctx.wizard.state.task;

    try {
      const dateTime = parseDateTime(
        state.date,
        state.time,
        ctx.state.user.timezone,
      );

      const task = await taskService.createTask({
        userId: ctx.state.user.id,
        title: state.title,
        description,
        scheduledAt: dateTime,
      });

      await ctx.reply(
        [
          "✅ کار با موفقیت ثبت شد.",
          "",
          `📌 ${task.title}`,
          `⏰ ${formatForUser(dateTime, ctx.state.user.timezone)}`,
          "",
          "🔔 یادآوری‌ها:",
          "• ۲۴ ساعت قبل",
          "• ۱۲ ساعت قبل",
          "• ۱ ساعت قبل",
          "• ۳۰ دقیقه قبل",
          "• ۵ دقیقه قبل",
        ].join("\n"),
        {
          reply_markup: {
            remove_keyboard: true,
          },
        },
      );

      await ctx.scene.leave();
    } catch (error) {
      if (error.message === "INVALID_DATE_TIME") {
        await ctx.reply("⚠️ تاریخ یا ساعت واردشده معتبر نیست.");
        return;
      }

      if (error.message === "TASK_DATE_IN_PAST") {
        await ctx.reply("⚠️ زمان انجام کار نمی‌تواند در گذشته باشد.");
        return;
      }

      throw error;
    }
  },
);

module.exports = taskScene;
