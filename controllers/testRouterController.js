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

// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//

const handleTestGet = tryCatchMiddleware(async (req, res, next) => {
  let availableClients = await handlePrismaGetSingleData("client");

  responseSend(res, availableClients);
});

const handleTestPost = tryCatchMiddleware(async (req, res, next) => {
  // let data = await handlePrismaGetPostData("client");
  const { age, address, additionalData, userId } = req.body;

  // let checkUserExist = await prisma.profile.findUnique({
  //   where:{
  //     userId:userId
  //   }
  // })
  // if(!checkUserExist){

  //   let data =  await prisma.profile.create({
  //     data: req.body,
  //   });
  //   responseSend(res, data);
  // } else {
  let data = await prisma.profile.upsert({
    create: {
      age,
      address,
      additionalData,
      userId,
    },
    update: {
      age,
      address,
      additionalData,
    },
    where: {
      userId,
    },
    include: {
      user: true,
    },
  });

  function excludePasswordAndID(user, keys) {
    for (let key of keys) {
      delete user[key];
      delete user.user[key];
    }
    return user;
  }
  const userWithoutPassword = excludePasswordAndID(data, ["password", "id"]);

  responseSend(res, userWithoutPassword);
  // }
});

module.exports = {
  handleTestGet,
  handleTestPost,
};
