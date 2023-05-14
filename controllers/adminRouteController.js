const express = require("express");
const app = express();
const tryCatchMiddleware = require("../middlewares/tryCatch");
const { coloredLog } = require("../utils/coloredLog");
const { ErrorHandler } = require("../utils/errorHandler");
const responseSend = require("../utils/responseSend");
const { obtainToken } = require("../utils/oAuthFunctions");
const { deleteToken } = require("../config/oAuthModelConfForSQL");
const bcrypt = require("bcrypt");
// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//

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

const adminLoginHandler = tryCatchMiddleware(async (req, res) => {
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

const adminLogoutHandler = tryCatchMiddleware(async (req, res) => {
  let status = await deleteToken(req);
  if (status) {
    responseSend(res, {
      message: "Successfully logged out",
    });
  } else {
    throw new ErrorHandler("Access denied", 403);
  }
});

const adminAccountUpdateHandler = tryCatchMiddleware(async (req, res, next) => {
  const { email, phoneNumber, password, ...profiledata } = req.body;
  const userId = res.locals.useridfromtoken;

  if (phoneNumber && !/^(?:\+?88)?01[3-9]\d{8}$/.test(phoneNumber)) {
    throw new ErrorHandler("Invalid phone number", 406);
  }

  if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    throw new ErrorHandler("Invalid email address", 406);
  }

  if (password && password.length < 6) {
    throw new ErrorHandler(
      "Password length must be between 6 to 32 characters",
      406
    );
  }

  const updateData = {};

  if (email) {
    updateData.email = email;
  }

  if (phoneNumber) {
    updateData.phoneNumber = phoneNumber;
  }

  if (password) {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    updateData.password = hash;
  }

  const userProfileData = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...profiledata,
      ...updateData,
    },
  });

  const publicProfile = sanitizeUser(userProfileData, ["password"]);
  responseSend(res, publicProfile);
});

const adminPofileUpdateHandler = tryCatchMiddleware(async (req, res, next) => {
  const { email, phoneNumber, ...profileData } = req.body;

  let userId = res.locals.useridfromtoken;

  let updatedProfileData = await prisma.profile.upsert({
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
  const publicProfile = sanitizeUser(updatedProfileData, ["password", "id"]);

  responseSend(res, publicProfile);
});

const adminCreateNewUserHandler = tryCatchMiddleware(async (req, res, next) => {
  const { email, phoneNumber, password, ...profileData } = req.body;

  // Validate phoneNumber
  if (!phoneNumber || !/^(?:\+?88)?01[3-9]\d{8}$/.test(phoneNumber)) {
    throw new ErrorHandler("Invalid phone number", 406);
  }

  // Validate email
  if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    throw new ErrorHandler("Invalid email address", 406);
  }

  // Validate password
  if (password && password.length < 6) {
    throw new ErrorHandler(
      "Password length must be between 6 to 32 characters",
      406
    );
  }

  // Create a new user
  const newUser = await prisma.user.create({
    data: {
      email: email || null,
      phoneNumber: phoneNumber,
      password: password ? await bcrypt.hash(password, 12) : null,
      profile: {
        create: {
          ...profileData,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  // Sanitize user for public profile
  const publicProfile = sanitizeUser(newUser, ["password"]);

  responseSend(res, publicProfile);
});

module.exports = {
  adminLoginHandler,
  adminLogoutHandler,
  adminPofileUpdateHandler,
  adminAccountUpdateHandler,
  adminCreateNewUserHandler,
};
