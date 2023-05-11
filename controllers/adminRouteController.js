const express = require("express");
const app = express();
const tryCatchMiddleware = require("../middlewares/tryCatch");
const { coloredLog } = require("../utils/coloredLog");
const { ErrorHandler } = require("../utils/errorHandler");
const responseSend = require("../utils/responseSend");
const { obtainToken } = require("../utils/oAuthFunctions");
const { deleteToken } = require("../config/oAuthModelConfForSQL");

// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//

let adminLoginHandler = tryCatchMiddleware(async (req, res) => {
  const { authorization, grant_type, phoneNumber, password } = req.body;

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

  responseSend(res, token);
});

let adminLogoutHandler = tryCatchMiddleware(async (req, res) => {
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
  adminLoginHandler,
  adminLogoutHandler,
};
