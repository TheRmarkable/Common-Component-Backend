/**
 * @file Configures & initializes logger object
 * @module services/logger
 */
const path = require("path");
const winston = require("winston");
require("winston-daily-rotate-file");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const { splat, combine, timestamp: timestampFunc, printf } = winston.format;
const WalletLog = require('../models/other/log');


const sc_logging_format_as_text = combine(
  timestampFunc({format: 'YYYY-MM-DD HH:mm:ss'}),
  splat(),
  printf(({ timestamp, level, message, json_data, user }) => {
    let calling_module = null;
    let log = new WalletLog(message, { timestamp, level, json_data, user, calling_module });
    return log.as_text;
  })
);


const consoleLoggingFormat = combine(
  timestampFunc({format: 'HH:mm:ss'}),
  splat(),
  printf(({ timestamp, message }) => `${timestamp}\t|\t${message}`)
);



const fileLogger = new winston.transports.DailyRotateFile({
  filename: path.join("./", "logs", "%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  options: { flags: "a", mode: 0o666 },
  prettyPrint: true,
  colorize: true,
  format: sc_logging_format_as_text,
});


const consoleLogger = new winston.transports.Console({
  level: 'info',
  prettyPrint: true,
  colorize: true,
  format: consoleLoggingFormat,
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  transports: [fileLogger, consoleLogger],
});

const userLogger = (user) => ({
  info: (message, extra = {}) => logger.info(message, { ...extra, user }),
  debug: (message, extra = {}) => logger.debug(message, { ...extra, user }),
  error: (message, extra = {}) => logger.error(message, { ...extra, user }),
});

module.exports = logger;
module.exports.userLogger = userLogger;