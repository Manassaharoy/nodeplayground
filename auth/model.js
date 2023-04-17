const dotenv = require("dotenv").config();

const user = require("../models/schema/user");

/**
 * Configuration.
 */

var clientModel = require("../models/schema/client"),
  tokenModel = require("../models/schema/token"),
  loggedInUserModel = require("../models/schema/user");

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

var getAccessToken = function (token, callback) {
  console.log("getAccessToken *********");
  tokenModel
    .findOne({
      accessToken: token,
    })
    .lean()
    .exec(
      function (callback, err, token) {
        if (!token) {
          console.error("Token not found");
          let msg = "Token not found";
          callback(msg);
        }
        callback(err, token);
      }.bind(null, callback)
    );
};

const getClient = async (clientId, clientSecret) => {
  let client = await clientModel
    .findOne({
      clientId: clientId,
      clientSecret: clientSecret,
    })
    .lean();
  return client
};

// ! ********** MY ADDITION *********

// var saveToken = async function (token, client, user, callback) {
//   console.log("saveToken *********");
//   token.client = {
//     id: client.clientId,
//   };
//   token.user = {
//     username: user.username,
//   };
//   var tokenInstance = new tokenModel(token);
//   tokenModel
//     .findOne({
//       user: { username: token.user.username },
//     })
//     .lean()
//     .exec(
//       async function (callback, err, token) {
//         if (!token) {
//           tokenInstance.save(
//             function (callback, err, token) {
//               callback(err, token);
//             }.bind(null, callback)
//           );
//           callback(err, tokenInstance);
//           console.log("No token found!!! NEW TOKEN GERENATED");
//         }
//         callback(err, token);
//       }.bind(null, callback)
//     );
// };


const saveToken = async (token, client, user, callback) => {
	console.log("saveToken");
	console.log("token ********* ", token);
	console.log("user ********* ", user);
	token.client = {
	  id: client.clientId,
	};
  
	token.user = {
	  username: user.username || user.email || user.phoneNumber,
	};
  
	try {
	  const savedToken = await tokenModel.create(token);
	  const { _id, __v, ...result } = savedToken.toObject();
	  // console.error("savedToken ---", savedToken);
	  callback(null, result);
	  // console.error("result ---", result);
    return result;
	} catch (err) {
	  console.error("Token not saved");
	  callback(err);
	}
  };

// ********** MY ADDITION Ends ******

/*
 * Method used only by password grant type.
 */

const getUser = async (username, password) => {
  // let encPassword = await bcrypt.hash(password, 12);

  console.log("getUser *********", username, password);

    const user = await loggedInUserModel.findOne({ email:username }).lean();
    if (!user) {
      console.error("User not found");
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

var getRefreshToken = function (refreshToken, callback) {
  console.log("getRefreshToken *********");
  tokenModel
    .findOne({
      refreshToken: refreshToken,
    })
    .lean()
    .exec(
      function (callback, err, token) {
        if (!token) {
          console.error("Token not found");
        }

        callback(err, token);
      }.bind(null, callback)
    );
};

var revokeToken = async function (token, callback) {
  // try {
  console.log("revokeToken *********");
  let username = await tokenModel.findOne({
    accessToken: token.accessToken,
  });

  if (username) {
    await user.findOneAndUpdate(
      {
        username: username.user.username,
      },
      {
        $set: {
          loggedinID: "",
        },
      }
    );
  }

  tokenModel
    .deleteOne({
      accessToken: token.accessToken,
    })
    .exec(
      function (done, err, results) {
        var deleteSuccess = results && results.deletedCount === 1;

        if (!deleteSuccess) {
          console.log("No token found!");
          // callback(err);
          let msg = "No token found!";
          // return response.json(msg);
        }
        console.log("Token removed!");
        // callback('Token Deleted!')
        // response.status(200).sendStatus("token removed")
      }.bind(null, callback)
    );
};

/**
 * Export model definition object.
 **/

module.exports = {
  getAccessToken: getAccessToken,
  getClient: getClient,
  saveToken: saveToken,
  getUser: getUser,
  getUserFromClient: getUserFromClient,
  getRefreshToken: getRefreshToken,
  revokeToken: revokeToken,
  loadExampleData: loadExampleData,
};
