const { ErrorHandler } = require("../utils/errorHandler");
const { tokenCheck } = require("../utils/oAuthFunctions");
const tryCatchMiddleware = require("./tryCatch");

const isValidAdmin = tryCatchMiddleware(async (req, res, next) => {
  const requiredParams = [
    "authorization",
    "grant_type",
    "phoneNumber",
    "password",
  ];

  if (!requiredParams.every((param) => req.body.hasOwnProperty(param))) {
    throw new ErrorHandler("Missing required parameters", 400);
  } else {
    const { authorization, grant_type, phoneNumber, password } = req.body;

    if (grant_type !== "password") {
      throw new ErrorHandler("Invalid grant_type", 406);
    } else if (authorization !== "application:secret") {
      throw new ErrorHandler("Invalid authorization value", 406);
    } else if (phoneNumber === null || phoneNumber === "") {
      throw new ErrorHandler("Invalid phone number", 406);
    } else if (password === null || password === "") {
      throw new ErrorHandler("Invalid password", 406);
    } else {
      next();
    }
  }
});

const isValid = tryCatchMiddleware(async (req, res, next) => {
  const requiredParams = [
    "authorization",
    "grant_type",
    "phoneNumber",
    "password",
  ];

  if (!requiredParams.every((param) => req.body.hasOwnProperty(param))) {
    throw new ErrorHandler("Missing required parameters", 400);
  } else {
    const { authorization, grant_type, phoneNumber, email } = req.body;

    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phoneNumber)) {
      throw new ErrorHandler("Invalid phone number", 406);
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      throw new ErrorHandler("Invalid email address", 406);
    } else if (grant_type !== "password") {
      throw new ErrorHandler("Invalid grant_type", 406);
    } else if (authorization !== "application:secret") {
      throw new ErrorHandler("Invalid authorization value", 406);
    } else {
      next();
    }
  }
});

module.exports = { isValid, isValidAdmin };
