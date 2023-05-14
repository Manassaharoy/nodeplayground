const { ErrorHandler } = require("../utils/errorHandler");
const { tokenCheck } = require("../utils/oAuthFunctions");
const tryCatchMiddleware = require("./tryCatch");

// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//

const isAdminCheckBeforeLogin = tryCatchMiddleware(async (req, res, next) => {
  const { phoneNumber, email } = req.body;

  if (!phoneNumber) {
    throw new ErrorHandler("Phone number is required", 400);
  }

  let userData = await prisma["user"].findUnique({
    where: {
      phoneNumber: phoneNumber,
    },
  });

  if (userData?.role === "admin") {
    // user is authenticated, move on to the next middleware

    res.locals.useridfromtoken = userData.user;

    next();
  } else {
    // user is not authenticated, throw an error
    throw new ErrorHandler("Access denied", 401);
  }
});

const isAdminCheckAfterLogin = tryCatchMiddleware(async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];

  const userDataID = await prisma.token.findFirst({
    where: {
      accessToken: accessToken,
    },
  });

  if (!userDataID) {
    throw new ErrorHandler("Access denied", 401);
  } else {
    let userData = await prisma["user"].findUnique({
      where: {
        id: userDataID.user,
      },
    });

    if (userData?.role === "admin") {
      // user is authenticated, move on to the next middleware
      res.locals.useridfromtoken = userDataID.user;

      next();
    } else {
      // user is not authenticated, throw an error
      throw new ErrorHandler("Access denied", 401);
    }
  }
});

module.exports = { isAdminCheckBeforeLogin, isAdminCheckAfterLogin };
