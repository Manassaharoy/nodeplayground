const express = require("express");
const app = express();
const tryCatchMiddleware = require("../middlewares/tryCatch");
const User = require("../models/schema/user");
const { coloredLog } = require("../utils/coloredLog");
const { ErrorHandler } = require("../utils/errorHandler");
const responseSend = require("../utils/responseSend");
const bcrypt = require("bcrypt");
const { obtainToken, tokenCheck } = require("../utils/oAuthFunctions");
const { deleteToken } = require("../config/oAuthModelConf");

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
  const existingUser = await User.findOne({
    phoneNumber: phoneNumber,
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
    // create a new user instance with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email: email && email,
      phoneNumber,
      password: hashedPassword,
    });

    // save the user instance to the database
    await newUser
      .save()
      .then(() => {
        responseSend(res, { message: "User created" });
      })
      .catch((err) => {
        console.log(err);
        if (
          err.message.includes(
            "User validation failed: phoneNumber: Please enter a valid Bangladeshi phone number"
          )
        ) {
          throw new ErrorHandler(err.message, 406);
        } else if (
          err.message.includes(
            "User validation failed: email: Please enter a valid email address"
          )
        ) {
          throw new ErrorHandler(err.message, 406);
        } else if (err.code === 11000) {
          coloredLog([err.code, err.message], 1);
          throw new ErrorHandler(
            `${JSON.stringify(err.keyValue)} already exists`,
            409
          );
        } else {
          throw new ErrorHandler(err.message, 500);
        }
      });
  }
});

let loginHandler = tryCatchMiddleware(async (req, res) => {
  let token = await obtainToken(req, res).then((tokenData) => {
    return tokenData;
  });
  responseSend(res, token);
});

let accessChekingHandler = tryCatchMiddleware(async (req, res) => {
  let tokenStatus = await tokenCheck(req, res);

  if (tokenStatus) {
    responseSend(res, "Valid");
  } else {
    throw new ErrorHandler("Access denied", 401);
  }
});

let logoutHandler = tryCatchMiddleware(async (req, res) => {
  let status = await deleteToken(req);
  if (status) {
    responseSend(res, {
        message:"Successfully logged out"
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
};
