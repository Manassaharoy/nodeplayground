//? Prisma initialize
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const dotenv = require("dotenv").config();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { ErrorHandler } = require("../utils/errorHandler");
//? Supabase initialize
const { createClient } = require("@supabase/supabase-js");
const { coloredLog } = require("../utils/coloredLog");
// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.SUPABASE_DATABASE,
  process.env.SUPABASE_SECRET_KEY
);

let sourcePath = "public/uploads/profilePhotos";
let bucketURL = process.env.SUPABASE_BUCKET_URL || "/profilePhotos/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, sourcePath);
  },
  filename: async (req, file, cb) => {
    const { originalname } = file;

    let userId = await prisma.token.findFirst({
      where: {
        accessToken: req.headers.authorization.split(" ")[1],
      },
    });

    let filename = `${userId.user}${path.extname(originalname)}`;

    let DBfilePath = sourcePath + filename;
    let DBfileName = "staticfiles/uploads/profilePhotos/" + filename;
    let DBfilePathToBucket = bucketURL + "profilePhotos/" + filename;

    //? UPDATE USER PROFILE IN DATABASE WITH URL
    await prisma.profile.upsert({
      create: {
        userId: userId.user,
        profilePhotoURL: DBfileName,
        profilePhotoPath: DBfilePath,
        profilePhotoBucketURL: DBfilePathToBucket,
      },
      update: {
        profilePhotoURL: DBfileName,
        profilePhotoPath: DBfilePath,
        profilePhotoBucketURL: DBfilePathToBucket,
      },
      where: {
        userId: userId.user,
      },
      include: {
        user: true,
      },
    });

    cb(null, filename);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    // You can always pass an error if something goes wrong:
    cb(new ErrorHandler("Only image is supported", 415), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1000 * 1000, // mb * kb * byte
    files: 1,
  },
});
const uploadSingleSupabase = upload.single("profilePhoto");
const uploadMultipleSupabase = upload.array("profilePhoto");

module.exports = {
  uploadSingleSupabase,
  uploadMultipleSupabase,
};
