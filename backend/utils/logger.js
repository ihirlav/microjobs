// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Log level
  format: winston.format.json(), // Log format
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' }), // Log to file
    new winston.transports.Console() // Log to console
  ]
});

module.exports = logger;