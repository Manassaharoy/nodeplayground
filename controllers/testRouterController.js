const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const { coloredLog } = require("../utils/coloredLog.js");
const { ErrorHandler } = require("../utils/errorHandler.js");
const path = require("path");
const os = require("os");
const sendResponse = require("../utils/sendResponse.js");
const responseSend = require("../utils/responseSend.js");
// to throw error =>  throw new ErrorHandler(message, statusCode);
// to send response => data object{} and call responseSend(res, data)
const testGetHandler = tryCatchMiddleware(async (req, res, next) => {
  const { data } = req.body;
  if (data) {
    responseSend(res, data);
  } else {
    throw new ErrorHandler("Sent this error", 404);
  }
});

const testPostHandler = tryCatchMiddleware(async (req, res, next) => {
  let data = {
    text: "POST is okay",
  };
  responseSend(res, data);
});

module.exports = {
  testGetHandler,
  testPostHandler,
};
