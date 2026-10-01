const pino = require("pino");
const config = require("./env");

const logger = pino({
  level: config.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
