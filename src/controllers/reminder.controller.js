const reminderService = require("../services/reminder.service");

async function listByTask(ctx, taskId) {
  const task = await reminderService.getTaskWithReminders(
    taskId,
    ctx.state.user.id,
  );

  if (!task) {
    return null;
  }

  return task.reminders;
}

async function regenerate(ctx, taskId) {
  return reminderService.regenerateForTask(taskId, ctx.state.user.id);
}

async function cancel(ctx, taskId) {
  return reminderService.cancelTaskReminders(taskId, ctx.state.user.id);
}

module.exports = {
  listByTask,
  regenerate,
  cancel,
};
