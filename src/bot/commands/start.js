const userService = require("../../services/user.service");

module.exports = async (ctx) => {
  const user = ctx.state.user || (await userService.getOrCreateUser(ctx.from));

  await ctx.reply(
    [
      `👋 سلام ${user.firstName || user.first_name || "دوست من"}!`,
      "",
      "به نگاریار خوش اومدی. 🤖",
      "",
      "من می‌تونم کارها و برنامه‌هات رو ثبت کنم و قبل از زمان انجامشون بهت یادآوری کنم.",
      "",
      "🔔 ۲۴ ساعت قبل",
      "🔔 ۱۲ ساعت قبل",
      "🔔 ۱ ساعت قبل",
      "🔔 ۳۰ دقیقه قبل",
      "🔔 ۵ دقیقه قبل",
      "",
      "از منوی زیر شروع کن. 👇",
    ].join("\n"),
    {
      reply_markup: {
        keyboard: [
          ["➕ افزودن کار"],
          ["📋 کارهای من", "📅 برنامه امروز"],
          ["⚙️ تنظیمات"],
        ],
        resize_keyboard: true,
        is_persistent: true,
      },
    },
  );
};
