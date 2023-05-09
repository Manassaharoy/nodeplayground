// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const multer = require("multer");
const { ErrorHandler } = require("../utils/errorHandler");
const dotenv = require("dotenv").config();

let sourcePath = "public/uploads/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, sourcePath);
  },
  another: (req, res, cb)=>{
    console.log("----------- I ran here ---------")
    cb(null, true);
  },
  filename: async (req, file, cb) => {
    const { originalname } = file;
    let userId = await prisma.token.findFirst({
      where: {
        accessToken: req.headers.authorization.split(" ")[1],
      },
    });

    let filename = `/${userId.user}.${originalname.split(".")[1]}`;

    let DBfilePath = sourcePath + filename;
    let DBfileName =
      process.env.BUCKET_LINK + `${userId.user}.${originalname.split(".")[1]}`;

    //? UPDATE USER PROFILE IN DATABASE WITH URL
    await prisma.profile.upsert({
      create: {
        userId: userId.user,
        profilePhoto: DBfileName,
        profilePhotoPath: DBfilePath,
      },
      update: {
        profilePhoto: DBfileName,
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

const upload = multer({ storage, fileFilter });
const uploadSingle = upload.single("profileImage");
const uploadMultiple = upload.array("profileImage");

module.exports = {
  uploadSingle,
  uploadMultiple,
};
