'use strict'

const winston = require('winston')

const LOG_INFO = "info";
const WARN_INFO = "warn";
const ERROR_INFO = "error";

function info(msg = "", objects = {}) {
  return winston.log(LOG_INFO, msg, objects)
}

function warn(msg = "", objects = {}) {
  return winston.log(WARN_INFO, msg, objects)
}

function error(msg = "", objects = {}) {
  return winston.log(ERROR_INFO, msg, objects)
}

module.exports = {
  custom: winston,
  info: info,
  warn: warn,
  error: error
}
