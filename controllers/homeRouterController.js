const os = require("os");
const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const { coloredLog } = require("../utils/coloredLog.js");
const { ErrorHandler } = require("../utils/errorHandler.js");
const responseSend = require("../utils/responseSend.js");

// to throw error =>  return next(new ErrorHandler(message, statusCode));

const homeGetHandler = tryCatchMiddleware(async (req, res, next) => {
  res.render("index");
});

const homePostHandler = tryCatchMiddleware(async (req, res, next) => {
  // let data = {
  //   text: os.cpus().length,
  // };
  // responseSend(res, data);
  throw new ErrorHandler("Custom error", 423)
});

module.exports = {
  homeGetHandler,
  homePostHandler,
};
