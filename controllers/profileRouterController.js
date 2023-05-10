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

// Sanitize user for admin view
// const adminView = sanitizeUser(userProfileData, []);

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
    userProfileData.profile.profilePhotoURL
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
  handlePhotoRemove,
  handlePasswordChange,
};
