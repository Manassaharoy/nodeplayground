const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

// Create a Winston logger instance
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      dirname: path.join(__dirname, "../logs"),
      filename: "application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d",
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

// Define the logger middleware function
const loggerMiddleware = (req, res, next) => {
  // Log the request method and URL
  logger.info(`${req.method} ${req.url}`, {
    timestamp: new Date().toISOString(),
  });

  // Move on to the next middleware or route handler
  next();
};

// Export the logger middleware function for use in other modules
module.exports = loggerMiddleware;
