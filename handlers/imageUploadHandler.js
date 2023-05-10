// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const multer = require("multer");
const path = require("path");
const { ErrorHandler } = require("../utils/errorHandler");
const dotenv = require("dotenv").config();

let sourcePath = "public/uploads/profilePhotos";

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
    console.log("*******************", path.extname(originalname));

    let filename = `${userId.user}${path.extname(originalname)}`;

    let DBfilePath = sourcePath + filename;
    let DBfileName = "staticfiles/uploads/profilePhotos/" + filename;

    //? UPDATE USER PROFILE IN DATABASE WITH URL
    await prisma.profile.upsert({
      create: {
        userId: userId.user,
        profilePhotoURL: DBfileName,
        profilePhotoPath: DBfilePath,
      },
      update: {
        profilePhotoURL: DBfileName,
        profilePhotoPath: DBfilePath,
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
const uploadSingle = upload.single("profilePhoto");
const uploadMultiple = upload.array("profilePhoto");

module.exports = {
  uploadSingle,
  uploadMultiple,
};
