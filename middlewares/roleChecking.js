const { ErrorHandler } = require("../utils/errorHandler");
const { tokenCheck } = require("../utils/oAuthFunctions");
const tryCatchMiddleware = require("./tryCatch");

// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//

const isAllowed = tryCatchMiddleware(async (req, res, next) => {
  const { phoneNumber, email } = req.body;

  if (!phoneNumber) {
    throw new ErrorHandler("Phone number is required", 400);
  }

  let userData = await prisma["user"].findUnique({
    where: {
      phoneNumber: phoneNumber,
    },
  });

  //   console.log("user data ----- ", userData);

  if (userData?.role === "admin") {
    // user is authenticated, move on to the next middleware

    next();
  } else {
    // user is not authenticated, throw an error
    throw new ErrorHandler("Access denied", 401);
  }
});

module.exports = isAllowed;
