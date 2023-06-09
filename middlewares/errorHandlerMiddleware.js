const multer = require("multer");
const HttpErrors = require("../data/httpErrors.js"); // assuming your enum file is named HttpStatusEnum.js
const encryptData = require("../utils/encryption.js");
const { ErrorHandler } = require("../utils/errorHandler.js");
const generateRandomNumber = require("../utils/randomNumber.js");

function errorHandlerMiddleware(error, req, res, next) {
  console.log(error);
  console.log("name --- ", error.name);
  console.log("code --- ", error.code);
  console.log("code --- ", error.code);

  let defaultError = {
    code: 500,
    message: "Something went wrong",
  };

  //? PRISMA ERROR HANDLING
  if (error.code === "P0002" || error.code === "P2002") {
    defaultError = {
      code: 409,
      message: "Conflict",
    };
    let encrpted = encryptData({
      success: false,
      data: null,
      isError: true,
      error: defaultError,
      errMsg: error.message,
    });

    const responseObject = {
      encoded: encrpted,
      jrn: generateRandomNumber(),
    };

    return res.status(defaultError.code).json(responseObject);
  }
  if (error.code === "P2003") {
    defaultError = {
      code: 406,
      message: "Method Not Allowed",
    };
    let encrpted = encryptData({
      success: false,
      data: null,
      isError: true,
      error: defaultError,
      errMsg: error.message,
    });

    const responseObject = {
      encoded: encrpted,
      jrn: generateRandomNumber(),
    };

    return res.status(defaultError.code).json(responseObject);
  }

  if (error.code === "P2025") {
    defaultError = {
      code: 404,
      message: "Data not found",
    };
    let encrpted = encryptData({
      success: false,
      data: null,
      isError: true,
      error: defaultError,
      errMsg: error.message,
    });

    const responseObject = {
      encoded: encrpted,
      jrn: generateRandomNumber(),
    };

    return res.status(defaultError.code).json(responseObject);
  }

  if (error instanceof multer.MulterError) {
    defaultError = {
      code: 406,
      message: "Not Acceptable",
    };

    let encrpted = encryptData({
      success: false,
      data: null,
      isError: true,
      error: defaultError,
      errMsg: error.message,
    });

    const responseObject = {
      encoded: encrpted,
      jrn: generateRandomNumber(),
    };

    return res.status(defaultError.code).json(responseObject);
  }

  if (error instanceof ErrorHandler) {
    let encrpted;
    if (HttpErrors[error.code]) {
      encrpted = encryptData({
        success: false,
        data: null,
        isError: true,
        error: HttpErrors[error.code],
        errMsg: error.message,
      });
    } else {
      encrpted = encryptData({
        success: false,
        data: null,
        isError: true,
        error: defaultError,
        errMsg: error.message,
      });
    }

    const responseObject = {
      encoded: encrpted,
      jrn: generateRandomNumber(),
    };

    return res
      .status(HttpErrors[error.code] ? error.code : defaultError.code)
      .json(responseObject);
  }

  let encrpted = encryptData({
    success: false,
    data: null,
    isError: true,
    error: defaultError,
    errMsg: error.message,
  });

  const responseObject = {
    encoded: encrpted,
    jrn: generateRandomNumber(),
  };

  return res.status(500).json(responseObject);
}

module.exports = {
  errorHandlerMiddleware,
};
