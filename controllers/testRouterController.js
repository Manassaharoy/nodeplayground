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

const { createClient } = require("@supabase/supabase-js");

// Create a single supabase client for interacting with your database
const supabase = createClient(
  "http://localhost:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
);
const fs = require("fs");
const path = require("path");

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
  const { dataaaa, errorrrr } = await supabase.storage.createBucket("uploads", {
    public: true,
    // allowedMimeTypes: ["image/png", ],
    // fileSizeLimit: 5000,
  });

  // console.log(data, error);

  // const { data, error } = await supabase.storage.listBuckets();

  // const filePath = path.join(
  //   __dirname,
  //   "../public/uploads/profilePhotos/54865.jpeg"
  // );
  // const fileData = fs.readFileSync(filePath);

  // console.log("filePath ----", path.extname(filePath));

  // const avatarFile = fileData;
  // const { data, error } = await supabase.storage
  //   .from("avatars")
  //   .upload(`${"filename" + path.extname(filePath)}`, avatarFile, {
  //     cacheControl: "3600",
  //     upsert: true,
  //   });

  // const { datas } = supabase.storage
  //   .from("avatars")
  //   .getPublicUrl("filename.jpeg");
  // console.log("url of image ------- ", datas);

  // console.log("All buckets ------- ", data);
  // console.log("All buckets ------- ", error);

  // responseSend(res, { data: data, error: error });

    const filePath = path.join(
      __dirname,
      "../public/uploads/profilePhotos/54865.jpeg"
    );
  const fileData = fs.readFileSync(filePath);

  const fileName = `filename${path.extname(filePath)}`;

  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(fileName, fileData, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    // Handle error
    responseSend(res, { error });
    return;
  }

  const publicURL = await supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  console.log("URL of image:", publicURL);

  responseSend(res, { data, publicURL });
});

const handleTestPost = tryCatchMiddleware(async (req, res, next) => {
  responseSend(res, { fail: null });
});

const handleTestImageUpload = tryCatchMiddleware(async (req, res, next) => {
  let data = { status: "uploaded" };
  responseSend(res, data);
});

module.exports = {
  handleTestGet,
  handleTestPost,
  handleTestImageUpload,
};
