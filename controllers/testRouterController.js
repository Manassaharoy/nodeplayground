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
const {
  handlePrismaGetSingleData,
  handlePrismaGetPostData,
} = require("../handlers/prismaHandlers");

// to throw error =>  throw new ErrorHandler(message, statusCode);
// to send response => data object{} and call responseSend(res, data)

const handleTestGet = tryCatchMiddleware(async (req, res, next) => {
  let availableClients = await handlePrismaGetSingleData("client");

  responseSend(res, availableClients);
});

const handleTestPost = tryCatchMiddleware(async (req, res, next) => {
  let data = await handlePrismaGetPostData("client");
  responseSend(res, data);
});

module.exports = {
  handleTestGet,
  handleTestPost,
};
