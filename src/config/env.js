require("dotenv").config();

const requiredEnv = ["BOT_TOKEN", "DB_HOST", "DB_NAME", "DB_USER"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const port = Number(process.env.DB_PORT || 3306);
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT || 10);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("Invalid DB_PORT");
}

if (!Number.isInteger(connectionLimit) || connectionLimit <= 0) {
  throw new Error("Invalid DB_CONNECTION_LIMIT");
}

module.exports = Object.freeze({
  botToken: process.env.BOT_TOKEN,

  database: Object.freeze({
    host: process.env.DB_HOST,
    port,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    connectionLimit,
  }),

  timezone: process.env.TIMEZONE || "Asia/Tehran",

  logLevel: process.env.LOG_LEVEL || "info",
});
