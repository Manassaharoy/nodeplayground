const { ErrorHandler } = require("../utils/errorHandler");
const { tokenCheck } = require("../utils/oAuthFunctions");
const tryCatchMiddleware = require("./tryCatch");

const isAuthenticated = tryCatchMiddleware(async (req, res, next) => {
  let tokenStatus = await tokenCheck(req, res);

  if (tokenStatus) {
    // user is authenticated, move on to the next middleware
    next();
  } else {
    // user is not authenticated, throw an error
    throw new ErrorHandler("Access denied", 401);
  }
});

module.exports = isAuthenticated;
