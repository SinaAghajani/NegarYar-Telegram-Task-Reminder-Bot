const taskService = require("../services/task.service");

async function create(ctx, data) {
  return taskService.createTask({
    ...data,
    userId: ctx.state.user.id,
  });
}

async function list(ctx, options = {}) {
  return taskService.getUserTasks(ctx.state.user.id, options);
}

async function get(ctx, taskId) {
  return taskService.getTask(taskId, ctx.state.user.id);
}

async function update(ctx, taskId, data) {
  return taskService.updateTask(taskId, ctx.state.user.id, data);
}

async function complete(ctx, taskId) {
  return taskService.completeTask(taskId, ctx.state.user.id);
}

async function cancel(ctx, taskId) {
  return taskService.cancelTask(taskId, ctx.state.user.id);
}

async function remove(ctx, taskId) {
  return taskService.deleteTask(taskId, ctx.state.user.id);
}

module.exports = {
  create,
  list,
  get,
  update,
  complete,
  cancel,
  remove,
};
