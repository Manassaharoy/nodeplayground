const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const contactus = require("../models/schema/contactus.js");
const product = require("../models/schema/product.js");
const { coloredLog } = require("../utils/coloredLog.js");
const { ErrorHandler } = require("../utils/errorHandler.js");
const responseSend = require("../utils/responseSend.js");
const setSendData = require("../utils/setSendData.js");
// to throw error =>  throw new ErrorHandler(message, statusCode);
// to send response => data object{} and call responseSend(res, data);

const cvGetHandler = tryCatchMiddleware(async (req, res, next) => {
  responseSend(res, {
    sent: "okay",
  });
});

const cvPostHandler = tryCatchMiddleware(async (req, res, next) => {
  responseSend(res, {
    sent: "okay",
  });
});

module.exports = {
  cvGetHandler,
  cvPostHandler,
};
