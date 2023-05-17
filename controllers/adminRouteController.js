const express = require("express");
const app = express();
const tryCatchMiddleware = require("../middlewares/tryCatch");
const { coloredLog } = require("../utils/coloredLog");
const { ErrorHandler } = require("../utils/errorHandler");
const responseSend = require("../utils/responseSend");
const { obtainToken } = require("../utils/oAuthFunctions");
const bcrypt = require("bcrypt");
const fs = require("fs");
const dotenv = require("dotenv").config();

// TODO: Checking SQL
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_DATABASE,
  process.env.SUPABASE_SECRET_KEY
);

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

function hideFieldsDateExcluded(data, fieldsToHide) {
  const newData = { ...data };

  for (const field of fieldsToHide) {
    delete newData[field];
  }

  // Recursively process nested objects
  for (const key in newData) {
    if (typeof newData[key] === "object" && newData[key] !== null) {
      newData[key] = hideFields(newData[key], fieldsToHide);
    }
  }

  return newData;
}

function hideFields(data, fieldsToHide) {
  const newData = { ...data };

  for (const field of fieldsToHide) {
    if (newData[field] instanceof Date) {
      newData[field] = newData[field].toISOString();
    }

    delete newData[field];
  }

  // Recursively process nested objects
  for (const key in newData) {
    if (typeof newData[key] === "object" && newData[key] !== null) {
      newData[key] = hideFields(newData[key], fieldsToHide);
    }
  }

  return newData;
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

const adminProfileViewHandler = tryCatchMiddleware(async (req, res, next) => {
  const userId = res.locals.useridfromtoken;

  let adminProfileData = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

  const publicProfile = sanitizeUser(adminProfileData, ["password"]);
  responseSend(res, publicProfile);
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

const adminListAllUserHandler = tryCatchMiddleware(async (req, res, next) => {
  let page =
    parseInt(req.query.page) <= 0 ? 0 : parseInt(req.query.page) - 1 || 0;
  let items =
    (parseInt(req.query.items) <= 0 && 10) ||
    (parseInt(req.query.items) >= 100 && 100) ||
    10;

  const {
    createdAt,
    updatedAt,
    locked,
    deleted,
    minAge,
    maxAge,
    maritualStatus,
    role,
  } = req.query;

  const whereClause = {};

  if (createdAt) {
    if (createdAt.includes(",")) {
      const [startDate, endDate] = createdAt.split(",");
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      whereClause.createdAt = new Date(createdAt);
    }
  }

  if (updatedAt) {
    if (updatedAt.includes(",")) {
      const [startDate, endDate] = updatedAt.split(",");
      whereClause.updatedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      whereClause.updatedAt = new Date(updatedAt);
    }
  }

  if (locked) {
    whereClause.locked = locked === "true";
  }

  if (deleted) {
    whereClause.deleted = deleted === "true";
  }

  if (minAge && maxAge) {
    whereClause.profile = {
      ...whereClause.profile,
      age: {
        gte: parseInt(minAge),
        lte: parseInt(maxAge),
      },
    };
  } else if (minAge) {
    whereClause.profile = {
      ...whereClause.profile,
      age: {
        gte: parseInt(minAge),
      },
    };
  } else if (maxAge) {
    whereClause.profile = {
      ...whereClause.profile,
      age: {
        lte: parseInt(maxAge),
      },
    };
  }

  if (maritualStatus) {
    whereClause.profile = {
      ...whereClause.profile,
      maritualStatus,
    };
  }

  whereClause.role = role ? role : "user";

  const userList = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
      locked: true,
      deleted: true,
      role: true,
      profile: {
        select: {
          age: true,
          fullName: true,
          gender: true,
          DOB: true,
          maritualStatus: true,
          address: true,
          profilePhotoPath: true,
          profilePhotoURL: true,
          additionalData: true,
          nomineeData: true,
          updatedAt: true,
        },
      },
    },
    where: whereClause,
    skip: page,
    take: items,
  });

  // Sanitize user for public profile
  const publicProfile = sanitizeUser(userList, ["password"]);

  responseSend(res, publicProfile);
});

const adminCreateNewUserHandler = tryCatchMiddleware(async (req, res, next) => {
  const { email, phoneNumber, password, role, ...profileData } = req.body;

  // Validate phoneNumber
  if (!phoneNumber || !/^(?:\+?88)?01[3-9]\d{8}$/.test(phoneNumber)) {
    throw new ErrorHandler("Invalid phone number", 406);
  }

  // Validate email
  if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    throw new ErrorHandler("Invalid email address", 406);
  }

  if (role) {
    if (role !== "user") {
      if (role !== "admin") {
        throw new ErrorHandler("Invalid role", 406);
      }
    }
  }

  if (!password) {
    throw new ErrorHandler("Password is missing", 406);
  } else {
    // Validate password
    if (password && password.length < 6) {
      throw new ErrorHandler(
        "Password length must be between 6 to 32 characters",
        406
      );
    }

    // generate a salt
    const salt = await bcrypt.genSalt(12);

    // hash the password along with our new salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber,
        password: hashedPassword,
        role: role ? role : "user",
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
  }
});

const adminUpdateUserProfileHandler = tryCatchMiddleware(
  async (req, res, next) => {
    let {
      id,
      email,
      phoneNumber,
      password,
      locked,
      deleted,
      role,
      age,
      fullName,
      DOB,
      gender,
      maritualStatus,
      address,
      profilePhotoPath,
      profilePhotoURL,
      additionalData,
      nomineeData,
    } = req.body;

    if (password) {
      // generate a salt
      const salt = await bcrypt.genSalt(12);

      // hash the password along with our new salt
      password = await bcrypt.hash(password, salt);
    }

    const updateUuserProfile = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        email,
        phoneNumber,
        password,
        locked,
        deleted,
        role,
        profile: {
          update: {
            age,
            fullName,
            DOB,
            gender,
            maritualStatus,
            address,
            profilePhotoPath,
            profilePhotoURL,
            additionalData,
            nomineeData,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Sanitize user for public profile
    const publicProfile = sanitizeUser(updateUuserProfile, ["password", "id"]);

    responseSend(res, publicProfile);
  }
);

const adminPhotoUploadHandler = tryCatchMiddleware(async (req, res, next) => {
  const userId = res.locals.useridfromtoken;

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

const adminPhotoUploadToSupabaseHandler = tryCatchMiddleware(
  async (req, res, next) => {
    const userId = res.locals.useridfromtoken;

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
            profilePhotoURL: true,
            profilePhotoBucketURL: true,
          },
        },
      },
    });

    responseSend(res, userProfileData);
  }
);

const adminPhotoRemoveHandler = tryCatchMiddleware(async (req, res, next) => {
  const userId = res.locals.useridfromtoken;

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

const adminAllLoggedInUsersHandler = tryCatchMiddleware(
  async (req, res, next) => {
    let page =
      parseInt(req.query.page) <= 0 ? 0 : parseInt(req.query.page) - 1 || 0;
    let items =
      (parseInt(req.query.items) <= 0 && 10) ||
      (parseInt(req.query.items) >= 100 && 100) ||
      10;

    const userList = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        // createdAt: true,
        // updatedAt: true,
        // locked: true,
        // deleted: true,
        role: true,
        // profile: {
        //   select: {
        //     age: true,
        //     fullName: true,
        //     gender: true,
        //     DOB: true,
        //     maritualStatus: true,
        //     address: true,
        //     profilePhotoPath: true,
        //     profilePhotoURL: true,
        //     additionalData: true,
        //     nomineeData: true,
        //     updatedAt: true,
        //   },
        // },
        token: {
          select: {
            id: true,
            accessToken: true,
            accessTokenExpiresAt: true,
            // refreshToken: true,
            // refreshTokenExpiresAt: true,
            createrAt: true,
          },
        },
      },
      where: {
        token: {
          some: {}, // Filter users who have at least one token
        },
      },
      skip: page,
      take: items,
    });

    // Sanitize user for public profile
    const publicProfile = sanitizeUser(userList, ["password"]);

    responseSend(res, publicProfile);
  }
);

const adminRemoveSessionForAnUserHandler = tryCatchMiddleware(
  async (req, res, next) => {
    const { id } = req.body;

    if (id) {
      let activeTokensForTheUser = await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          token: true,
        },
      });

      let tokensList = [];
      console.log(activeTokensForTheUser);
      activeTokensForTheUser.token.map((token) => {
        tokensList.push(token.id);
      });
      if (tokensList.length > 0) {
        let deletedTokenList = await prisma.token.deleteMany({
          where: {
            id: {
              in: tokensList,
            },
          },
        });
        responseSend(res, deletedTokenList);
      }
    } else {
      throw new ErrorHandler("Required parameter missing", 400);
    }
  }
);

module.exports = {
  adminLoginHandler,
  adminLogoutHandler,
  adminProfileViewHandler,
  adminPofileUpdateHandler,
  adminAccountUpdateHandler,
  adminListAllUserHandler,
  adminCreateNewUserHandler,
  adminUpdateUserProfileHandler,
  adminPhotoUploadHandler,
  adminPhotoUploadToSupabaseHandler,
  adminPhotoRemoveHandler,
  adminAllLoggedInUsersHandler,
  adminRemoveSessionForAnUserHandler,
};
