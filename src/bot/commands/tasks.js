const taskService = require("../../services/task.service");
const { formatTask } = require("../../utils/format.util");
const { LIMITS } = require("../../utils/constants");

module.exports = async (ctx) => {
  const user = ctx.state.user;

  const tasks = await taskService.getUserTasks(user.id, {
    status: "pending",
    limit: LIMITS.TASK_LIST,
    offset: 0,
  });

  if (!tasks.length) {
    await ctx.reply("📭 در حال حاضر هیچ کار فعالی نداری.");
    return;
  }

  const message = [
    "📋 کارهای من",
    "",
    ...tasks.map((task, index) => {
      return `${index + 1}. ${formatTask(task)}`;
    }),
  ].join("\n\n");

  await ctx.reply(message);
};
