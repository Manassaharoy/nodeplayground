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

// const multer = require("multer");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/uploads/");
//   },
//   filename: async (req, file, cb) => {
//     const { originalname } = file;
//     let userId = await prisma.token.findFirst({
//       where: {
//         accessToken: req.headers.authorization.split(" ")[1],
//       },
//     });
//     cb(null, `${userId.user}-${originalname}`);
//   },
// });

// const upload = multer({ storage }).single("profileImage");

const handleTestGet = tryCatchMiddleware(async (req, res, next) => {
  // let availableClients = await handlePrismaGetSingleData("client");

  responseSend(res, { fail: null });
});

const handleTestPost = tryCatchMiddleware(async (req, res, next) => {
  const { userId, ...profileData } = req.body;

  let data = await prisma.profile.upsert({
    create: {
      ...profileData,
      userId,
    },
    update: {
      ...profileData,
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
});

const handleTestImageUpload = tryCatchMiddleware(async (req, res, next) => {

  let data = {"status":"uploaded"};
  responseSend(res, data);

});

module.exports = {
  handleTestGet,
  handleTestPost,
  handleTestImageUpload,
};
