const express = require("express");
const app = express();
const tryCatchMiddleware = require("../middlewares/tryCatch");
const User = require("../models/schema/user");
const { coloredLog } = require("../utils/coloredLog");
const { ErrorHandler } = require("../utils/errorHandler");
const responseSend = require("../utils/responseSend");
const { obtainToken, tokenCheck } = require("../utils/oAuthFunctions");
const { deleteToken } = require("../config/oAuthModelConfForSQL");

// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//

let renderLoginPage = tryCatchMiddleware(async (req, res, next) => {
  res.render("login");
});

let renderSignUpPage = tryCatchMiddleware(async (req, res, next) => {
  res.render("signup");
});

let renderHomePage = tryCatchMiddleware(async (req, res, next) => {
  res.render("index");
});

let signUpHandler = tryCatchMiddleware(async (req, res) => {
  const { email, phoneNumber, password } = req.body;

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      phoneNumber: phoneNumber,
    },
  });

  if (existingUser) {
    coloredLog(["****** existingUser ******"], 1);
    throw new ErrorHandler("User exists", 409);
  }

  if (password.length < 6) {
    throw new ErrorHandler(
      "Password lenght must be between 6 to 32 characters",
      406
    );
  } else {
    await prisma.user
      .create({
        data: {
          email,
          phoneNumber,
          password,
        },
      })
      .then(() => {
        responseSend(res, { message: "User created" });
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(err.message, 500);
      });
  }
});

let loginHandler = tryCatchMiddleware(async (req, res) => {
  const { authorization, grant_type, phoneNumber, password } = req.body;

  // console.log(Buffer.from("application:secret").toString('base64'));
  // console.log(Buffer.from("YXBwbGljYXRpb246c2VjcmV0=", 'base64').toString('ascii'))

  req.headers = {
    authorization: `Basic ${Buffer.from(authorization).toString("base64")}`,
    "content-type": "application/x-www-form-urlencoded",
    "content-length": "62",
  };

  req.body = {
    grant_type: grant_type,
    username: phoneNumber,
    password: password,
  };

  let token = await obtainToken(req, res).then((tokenData) => {
    return tokenData;
  });

  console.log("token ------- ", token)

  responseSend(res, token);
});

let refreshTokenHanlder = tryCatchMiddleware(async (req, res) => {
  const { authorization, grant_type, phoneNumber, password, refreshToken } =
    req.body;

  req.headers = {
    authorization: `Basic ${Buffer.from(authorization).toString("base64")}`,
    "content-type": "application/x-www-form-urlencoded",
    "content-length": "62",
  };

  req.body = {
    grant_type: grant_type,
    username: phoneNumber,
    password: password,
    refresh_token: refreshToken,
  };

  let token = await obtainToken(req, res).then((tokenData) => {
    return tokenData;
  });
  responseSend(res, token);
});

let accessChekingHandler = tryCatchMiddleware(async (req, res) => {
  let tokenStatus = await tokenCheck(req, res);

  if (tokenStatus) {
    responseSend(res, { tokenValid: true });
  } else {
    throw new ErrorHandler("Access denied", 401);
  }
});

let logoutHandler = tryCatchMiddleware(async (req, res) => {
  let status = await deleteToken(req);
  if (status) {
    responseSend(res, {
      message: "Successfully logged out",
    });
  } else {
    throw new ErrorHandler("Access denied", 403);
  }
});

module.exports = {
  renderLoginPage,
  renderSignUpPage,
  renderHomePage,
  signUpHandler,
  loginHandler,
  accessChekingHandler,
  logoutHandler,
  refreshTokenHanlder,
};
