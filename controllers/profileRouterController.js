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
const fs = require("fs");
const dotenv = require("dotenv").config();
// to throw error =>  throw new ErrorHandler(message, statusCode);
// to send response => data object{} and call responseSend(res, data)

// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_DATABASE,
  process.env.SUPABASE_SECRET_KEY
);

let getUserId = async (req) => {
  let accessToken = req.headers.authorization.split(" ")[1];

  let userData = await prisma["token"].findFirst({
    where: {
      accessToken: accessToken,
    },
  });

  return userData.user;
};

function sanitizeUser(user, keysToExclude) {
  const sanitizedUser = { ...user };
  keysToExclude.forEach((key) => {
    delete sanitizedUser[key];
    if (sanitizedUser.user) {
      delete sanitizedUser.user[key];
    }
    if (sanitizedUser.profile) {
      delete sanitizedUser.profile[key];
    }
  });
  return sanitizedUser;
}

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
  let data = { status: "uploaded" };
  responseSend(res, data);
});

const handleProfileView = tryCatchMiddleware(async (req, res, next) => {
  let userId = await getUserId(req);

  let userProfileData = await prisma["user"].findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

  // Sanitize user for public profile
  const publicProfile = sanitizeUser(userProfileData, ["password", "id"]);

  responseSend(res, publicProfile);
});

const handleProfileChanges = tryCatchMiddleware(async (req, res, next) => {
  let userId = await getUserId(req);

  const profileData = req.body;

  let userProfileData = await prisma.profile.upsert({
    create: {
      ...profileData,
      userId: userId,
    },
    update: {
      ...profileData,
    },
    where: {
      userId: userId,
    },
    include: {
      user: true,
    },
  });

  // Sanitize user for public profile
  const publicProfile = sanitizeUser(userProfileData, ["password", "id"]);

  responseSend(res, publicProfile);
});

const handlePhotoUpload = tryCatchMiddleware(async (req, res, next) => {
  let userId = await getUserId(req);

  let userProfileData = await prisma["user"].findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      phoneNumber: true,
      createdAt: true,
      profile: {
        select: {
          userId: true,
          profilePhotoURL: true,
        },
      },
    },
  });

  responseSend(res, userProfileData);
});

const handlePhotoUploadToBucket = tryCatchMiddleware(async (req, res, next) => {
  let userId = await getUserId(req);

  const filePath = req.file.path;
  const fileData = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from("profilePhotos") // Specify the bucket name here
    .upload(req.file.filename, fileData, {
      cacheControl: "3600",
      upsert: false,
    });

  // Get the public URL of the uploaded file
  const fileUrl = await supabase.storage
    .from("profilePhotos") // Specify the bucket name here
    .getPublicUrl(req.file.filename);

  // Clean up the temporary file
  fs.unlinkSync(filePath);

  //TODO: profilePhotoURL is for link share from server and profilePhotoBucketURL is for supabase bucket

  let userProfileData = await prisma["user"].findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      phoneNumber: true,
      createdAt: true,
      profile: {
        select: {
          userId: true,
          profilePhotoBucketURL: true,
        },
      },
    },
  });

  responseSend(res, userProfileData);
});

const handlePhotoRemove = tryCatchMiddleware(async (req, res, next) => {
  let userId = await getUserId(req);

  let userProfileData = await prisma["user"].findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

  if (
    userProfileData.profile.profilePhotoPath &&
    userProfileData.profile.profilePhotoURL &&
    userProfileData.profile.profilePhotoBucketURL
  ) {
    // Remove the profile photo path and URL from the profile object
    const { profilePhotoPath, profilePhotoURL, ...updatedProfile } =
      userProfileData.profile;

    // Update the profile data in the database
    await prisma.profile.update({
      where: {
        id: updatedProfile.id,
      },
      data: {
        profilePhotoPath: null,
        profilePhotoURL: null,
        profilePhotoBucketURL: null,
      },
    });

    // Send a success response to the client
    responseSend(res, { message: "Profile photo removed successfully" });
  } else {
    // Send a response to the client indicating that there are no images to remove
    throw new ErrorHandler("No image found!", 404);
  }
});

const handlePasswordChange = tryCatchMiddleware(async (req, res, next) => {
  let userId = await getUserId(req);
  const { password } = req.body;

  if (password.length < 6) {
    throw new ErrorHandler(
      "Password lenght must be between 6 to 32 characters",
      406
    );
  } else {
    // generate a salt
    const salt = await bcrypt.genSalt(12);

    // hash the password along with our new salt
    const hash = await bcrypt.hash(password, salt);

    await prisma.user
      .update({
        where: {
          id: userId,
        },
        data: {
          password: hash,
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
      })
      .then((data) => {
        responseSend(res, data);
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(err.message, 500);
      });
  }
});

module.exports = {
  handleTestGet,
  handleTestPost,
  handleTestImageUpload,
  handleProfileView,
  handleProfileChanges,
  handlePhotoUpload,
  handlePhotoUploadToBucket,
  handlePhotoRemove,
  handlePasswordChange,
};
