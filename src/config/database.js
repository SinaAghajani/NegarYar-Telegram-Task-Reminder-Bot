const mysql = require("mysql2/promise");
const config = require("./env");
const logger = require("./logger");

const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  waitForConnections: true,
  connectionLimit: config.database.connectionLimit,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "Z",
  dateStrings: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

async function testConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();
    logger.info("MySQL connection established");
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function transaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function closeConnection() {
  await pool.end();
  logger.info("MySQL connection pool closed");
}

module.exports = {
  pool,
  transaction,
  testConnection,
  closeConnection,
};
