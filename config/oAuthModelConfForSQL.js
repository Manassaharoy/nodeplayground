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

/*
 * Methods used by all grant types.
 */

const getAccessToken = async (accessToken) => {
  console.log("getAccessToken *********");
  console.log("getAccessToken *********", accessToken);

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
  console.log("getClient *********");

  let client = await prisma.client.findFirst({
    where: {
      clientId: clientId,
      clientSecret: clientSecret,
    },
  });
  //   console.log("CLient data --------", client);
  return client;
};

const saveToken = async (token, client, user) => {
  console.log("saveToken ***********");

  token.client = {
    id: client.clientId,
  };

  token.user = {
    username: user.phoneNumber || user.username,
  };

  token.userid = user.id;

  await prisma.token.deleteMany({
    where: {
      user: user.id,
    },
  });

  const savedToken = await prisma.token
    .create({
      data: {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        client: token.client.id,
        user: user.id,
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
  // let encPassword = await bcrypt.hash(password, 12);

  console.log("getUser *********", username, password);

  //TODO: bycrypt password

  const user = await prisma.user.findFirst({
    where: {
      phoneNumber: username,
    },
  });

  if (!user) {
    console.error("User not found");
    throw new ErrorHandler("user not found", 401);
  }

  console.log("user --------", user);

  return user;
};

/*
 * Method used only by client_credentials grant type.
 */

var getUserFromClient = function (client, callback) {
  console.log("getUserFromClient *********");
  clientModel
    .findOne({
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      grants: "client_credentials",
    })
    .lean()
    .exec(
      function (callback, err, client) {
        if (!client) {
          console.error("Client not found");
        }

        callback(err, {
          username: "",
        });
      }.bind(null, callback)
    );
};

/*
 * Methods used only by refresh_token grant type.
 */

const getRefreshToken = async (refreshToken) => {
  console.log("getRefreshToken !*********!");
  let refreshTokenGenerate = await prisma.token.findFirst({
    where: { refreshToken: refreshToken },
  });
  console.log("refreshTokenGenerate ------- ", refreshTokenGenerate);
  return refreshTokenGenerate;
};

var revokeToken = async (token) => {
  console.log("revokeToken ------********- ");
  console.log("revokeToken ------********- ", token);


  let revokeToken = await prisma.token.delete({
    where: {
      refreshToken: token.refreshToken,
    },
  });

  console.log("revokeToken ------- ", revokeToken);
  return revokeToken;
};

/**
 * Export model definition object.
 **/
var deleteToken = async (req) => {
  console.log("****** deleteToken ****** ", req.body);

  const { user, accessToken } = req.body;

  const result = await prisma.token.deleteMany({
    where: {
      AND: [{ user }, { accessToken }],
    },
  });

  const deleteCount = result.count;

  if (deleteCount > 0) {
    return true;
  } else {
    return false;
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
};
