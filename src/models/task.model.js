const TaskModel = Object.freeze({
  tableName: "tasks",

  statuses: Object.freeze({
    PENDING: "pending",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  }),

  fields: Object.freeze([
    "id",
    "user_id",
    "title",
    "description",
    "scheduled_at",
    "status",
    "created_at",
    "updated_at",
  ]),

  create(data) {
    return {
      userId: Number(data.userId),
      title: String(data.title).trim(),
      description: data.description ? String(data.description).trim() : null,
      scheduledAt: data.scheduledAt,
      status: data.status || "pending",
    };
  },
});

module.exports = TaskModel;
