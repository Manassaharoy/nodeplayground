const dotenv = require("dotenv").config();

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

var loadExampleData = async function () {
  let availableClients = await clientModel.find();

  if (availableClients.length <= 0) {
    var client1 = new clientModel({
      id: "application", // TODO: Needed by refresh_token grant, because there is a bug at line 103 in https://github.com/oauthjs/node-oauth2-server/blob/v3.0.1/lib/grant-types/refresh-token-grant-type.js (used client.id instead of client.clientId)
      clientId: "application",
      clientSecret: "secret",
      grants: ["password", "refresh_token"],
      redirectUris: [],
    });

    var client2 = new clientModel({
      clientId: "confidentialApplication",
      clientSecret: "topSecret",
      grants: ["password", "client_credentials"],
      redirectUris: [],
    });

    client1.save();
    client2.save();
  }
};

/*
 * Methods used by all grant types.
 */

const getAccessToken = async (accessToken) => {
  console.log("getAccessToken *********", accessToken);
  const token = await tokenModel.findOne({ accessToken }).lean();
  if (!token) {
    console.error("Token not found");
  }
  return token;
};

const getClient = async (clientId, clientSecret) => {
  console.log("getClient *********");

  let client = await clientModel
    .findOne({
      clientId: clientId,
      clientSecret: clientSecret,
    })
    .lean();
  return client;
};

const saveToken = async (token, client, user) => {
  console.log("saveToken ***********");
  console.log("saveToken user ***********", user);
  token.client = {
    id: client.clientId,
  };

  token.user = {
    username: user.phoneNumber || user.username,
  };

  await tokenModel.deleteMany({
    "user.username": user.phoneNumber || user.username,
  });

  const savedToken = await tokenModel.create(token).then((data) => {
    const { _id, __v, ...result } = data.toObject();
    // callback(null, result);
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

  const user = await loggedInUserModel
    .findOne({ phoneNumber: username })
    .lean();
  if (!user) {
    console.error("User not found");
    throw new ErrorHandler("user not found", 401)
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    console.error("Invalid password");
    throw new ErrorHandler("invalid password", 401)
    // return null;
  }
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
  console.log("getRefreshToken *********");
  let refreshTokenGenerate = await tokenModel
    .findOne({
      refreshToken: refreshToken,
    })
    .lean();
  console.log("refreshTokenGenerate ------- ", refreshTokenGenerate);
  return refreshTokenGenerate;
};

var revokeToken = async (token) => {
  console.log("revokeToken ------********- ");

  let revokeToken = await tokenModel
    .deleteOne({
      refreshToken: token.refreshToken,
    })
    .lean();

  console.log("revokeToken ------- ", revokeToken);
  return revokeToken;
};

/**
 * Export model definition object.
 **/
var deleteToken = async (req) => {
  console.log("****** deleteToken ****** ", req.body);

  const { phoneNumber, accessToken } = req.body;

  let revokeToken = await tokenModel
    .deleteOne({
      $and: [{ "user.username": phoneNumber }, { accessToken: accessToken }],
    })
    .lean()
    .then((data) => {
      console.log("data -----", data);
      if (data.deletedCount > 0) {
        return true;
      } else {
        return false;
      }
    })
    .catch(() => {
      return false;
    });

  console.log("revokeToken ------- ", revokeToken);
  return revokeToken;
};

module.exports = {
  getAccessToken: getAccessToken,
  getClient: getClient,
  saveToken: saveToken,
  getUser: getUser,
  getUserFromClient: getUserFromClient,
  getRefreshToken: getRefreshToken,
  revokeToken: revokeToken,
  loadExampleData: loadExampleData,
  deleteToken: deleteToken,
};
