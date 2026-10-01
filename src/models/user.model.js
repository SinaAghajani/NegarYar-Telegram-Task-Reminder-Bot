const UserModel = Object.freeze({
  tableName: "users",

  fields: Object.freeze([
    "id",
    "telegram_id",
    "username",
    "first_name",
    "last_name",
    "language_code",
    "timezone",
    "is_active",
    "created_at",
    "updated_at",
  ]),

  create(data) {
    return {
      telegramId: Number(data.telegramId),
      username: data.username || null,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      languageCode: data.languageCode || null,
      timezone: data.timezone || "Asia/Tehran",
    };
  },
});

module.exports = UserModel;
