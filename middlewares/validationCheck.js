const { ErrorHandler } = require("../utils/errorHandler");
const { tokenCheck } = require("../utils/oAuthFunctions");
const tryCatchMiddleware = require("./tryCatch");

const isValid = tryCatchMiddleware(async (req, res, next) => {
  const requiredParams = [
    "authorization",
    "grant_type",
    "phoneNumber",
    "password",
  ];

  if (!requiredParams.every((param) => req.body.hasOwnProperty(param))) {
    throw new ErrorHandler("Missing required parameters", 400);
  }

  next();

  //   const { authorization, grant_type, phoneNumber, password } = req.body;

  //   if(!authorization || !grant_type || !phoneNumber || !password){
  //       throw new ErrorHandler("Missing required parameters", 400);
  //   }

  //   if (tokenStatus) {
  //     // user is authenticated, move on to the next middleware
  //     next();
  //   } else {
  //     // user is not authenticated, throw an error
  //     throw new ErrorHandler("Access denied", 401);
  //   }
});

module.exports = isValid;
