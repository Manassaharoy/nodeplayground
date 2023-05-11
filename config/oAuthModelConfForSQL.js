const dotenv = require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * FLOW:
 * for password_grant:
 * get client -> get user -> save token ->
 */
/**
 * Configuration.
 */

var clientModel = require("../models/schema/client"),
  tokenModel = require("../models/schema/token"),
  loggedInUserModel = require("../models/schema/user");
const { ErrorHandler } = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { coloredLog } = require("../utils/coloredLog");

const multilogin = process.env.MULTIPLE_DEVICE_LOGIN || false;

let getUserId = async (req) => {
  let accessToken = req.headers.authorization.split(" ")[1];

  let userData = await prisma["token"].findFirst({
    where: {
      accessToken: accessToken,
    },
  });

  if (userData) {
    return { user: userData?.user, accessToken: accessToken };
  } else {
    return null;
  }
};

/**
 * Add example client and user to the database (for debug).
 */

const loadExampleData = async function () {
  let availableClients = await prisma.client.findMany();

  if (availableClients.length <= 0) {
    await prisma["client"].createMany({
      data: [
        {
          id: "application",
          clientId: "application",
          clientSecret: "secret",
          grants: ["password", "refresh_token"],
          redirectUris: [],
        },
        {
          clientId: "confidentialApplication",
          clientSecret: "topSecret",
          grants: ["password", "client_credentials"],
          redirectUris: [],
        },
      ],
    });
  }
};

const createDefaultAdmin = async function () {
  let availableAdmin = await prisma.user.findMany({
    where: {
      role: "admin",
    },
  });
  if (availableAdmin.length <= 0) {
    const salt = await bcrypt.genSalt(12);
    // hash the password along with our new salt
    const hashedPassword = await bcrypt.hash("100200300", salt);
    await prisma["user"].create({
      data: {
        email: "admin@admin.com",
        phoneNumber: "01234567891",
        password: hashedPassword,
        role: "admin",
      },
    });
    coloredLog(["Created default admin"], 1);
  }
};

/*
 * Methods used by all grant types.
 */

const getAccessToken = async (accessToken) => {
  coloredLog("getAccessToken", 3);

  const token = await prisma.token.findFirst({
    where: {
      accessToken: accessToken,
    },
  });
  if (!token) {
    console.error("Token not found");
  }
  return token;
};

const getClient = async (clientId, clientSecret) => {
  coloredLog("getClient", 3);

  let client = await prisma.client.findFirst({
    where: {
      clientId: clientId,
      clientSecret: clientSecret,
    },
  });

  return client;
};

const saveToken = async (token, client, user) => {
  coloredLog("SAVETOKEN", 3);

  token.client = {
    id: client.clientId,
  };

  token.user = {
    username: user.phoneNumber || user.username,
  };

  token.userid = user.id;

  //TODO: MULTI LOGIN HANDLED HERE

  if (multilogin === "FALSE" || multilogin === "false" || !multilogin) {
    await prisma.token.deleteMany({
      where: {
        user: user.id,
      },
    });
  }
  const savedToken = await prisma.token
    .create({
      data: {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        client: token.client.id || client.clientId,
        user: user.id || user.userid,
        tokenAvailer: {
          connect: {
            id: user.id || user.userid,
          },
        },
      },
    })
    .then((data) => {
      const { id, ...result } = data;
      return result;
    });

  return savedToken;
};

/*
 * Method used only by password grant type.
 */

const getUser = async (username, password) => {
  coloredLog("getUser", 3);

  const user = await prisma.user.findFirst({
    where: {
      phoneNumber: username,
    },
  });

  if (!user) {
    // console.error("User not found");
    throw new ErrorHandler("user not found", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // console.error("Incorrect password");
    throw new ErrorHandler("incorrect password", 401);
  }

  return user;
};

/*
 * Method used only by client_credentials grant type.
 */
//TODO: THIS IS NOT UPDATED
const getUserFromClient = function (client, callback) {
  coloredLog("getUserFromClient *********", 3);
  // clientModel
  //   .findOne({
  //     clientId: client.clientId,
  //     clientSecret: client.clientSecret,
  //     grants: "client_credentials",
  //   })
  //   .lean()
  //   .exec(
  //     function (callback, err, client) {
  //       if (!client) {
  //         console.error("Client not found");
  //       }

  //       callback(err, {
  //         username: "",
  //       });
  //     }.bind(null, callback)
  //   );
  return null;
};

/*
 * Methods used only by refresh_token grant type.
 */

const getRefreshToken = async (refreshToken) => {
  coloredLog("getRefreshToken *********", 3);
  let refreshTokenGenerate = await prisma.token
    .findFirst({
      where: { refreshToken: refreshToken },
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log("error ------- ", error.message, error.code);
      throw new ErrorHandler(error.message, error.code);
    });

  refreshTokenGenerate = {
    id: refreshTokenGenerate.user,
    accessToken: refreshTokenGenerate.accessToken,
    accessTokenExpiresAt: refreshTokenGenerate.accessTokenExpiresAt,
    refreshToken: refreshTokenGenerate.refreshToken,
    refreshTokenExpiresAt: refreshTokenGenerate.refreshTokenExpiresAt,
    client: { id: refreshTokenGenerate.client },
    user: { userid: refreshTokenGenerate.user },
  };

  return refreshTokenGenerate;
};

const revokeToken = async (token) => {
  coloredLog("revokeToken ------********- ", 3);

  let getRefreshTokenUser = await prisma.token.findFirst({
    where: { refreshToken: token.refreshToken },
  });

  let revokeToken = await prisma.token.delete({
    where: {
      id: getRefreshTokenUser.id,
    },
  });

  return revokeToken;
};

/**
 * Export model definition object.
 **/
const deleteToken = async (req) => {
  coloredLog("deleteToken ------********- ", 3);

  let userId = await getUserId(req);

  if (!userId) {
    return false;
  } else {
    const { user, accessToken } = userId;

    if (multilogin === "FALSE" || multilogin === "false" || !multilogin) {
      const result = await prisma.token.deleteMany({
        where: {
          user,
        },
      });

      const deleteCount = result.count;

      if (deleteCount > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      const result = await prisma.token.deleteMany({
        where: {
          user,
          accessToken,
        },
      });

      const deleteCount = result.count;

      if (deleteCount > 0) {
        return true;
      } else {
        return false;
      }
    }
  }
};

module.exports = {
  getAccessToken: getAccessToken,
  getClient: getClient,
  saveToken: saveToken,
  getUser: getUser,
  getUserFromClient: getUserFromClient,
  getRefreshToken: getRefreshToken,
  revokeToken: revokeToken,
  loadExampleDataSQL: loadExampleData,
  deleteToken: deleteToken,
  createDefaultAdmin: createDefaultAdmin,
};
