const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const { coloredLog } = require("../utils/coloredLog.js");
const { ErrorHandler } = require("../utils/errorHandler.js");
const responseSend = require("../utils/responseSend.js");
// to throw error =>  return next(new ErrorHandler(message, statusCode));

const homeGetHandler = tryCatchMiddleware(async (req, res, next) => {
  let data = {
    text: "GET is okay",
  };
  responseSend(res, data);
});

const homePostHandler = tryCatchMiddleware(async (req, res, next) => {
  throw new ErrorHandler("custom error", 409);
});

module.exports = {
  homeGetHandler,
  homePostHandler,
};
