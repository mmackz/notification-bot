const winston = require("winston");

const logger = winston.createLogger({
   format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, message }) => {
         return `${timestamp} - ${message}`;
      })
   ),
   transports: [new winston.transports.Console()]
});

module.exports = logger;
