const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const { coloredLog } = require("../utils/coloredLog.js");
const { ErrorHandler } = require("../utils/errorHandler.js");
// to throw error =>  return next(new ErrorHandler(message, statusCode));

const firstHandlerFunction = tryCatchMiddleware(async (req, res, next) => {
  
  coloredLog(req.body, 5)

  next()

});

const secondHandlerFunction = tryCatchMiddleware(async (req, res, next) => {

  next()
  
});




module.exports = {
  firstHandlerFunction,
  secondHandlerFunction
};
