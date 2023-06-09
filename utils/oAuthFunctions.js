//? Initialize express server
const { log } = require("console");
const express = require("express");
const app = express();

//! OAUTH
const OAuth2Server = require("oauth2-server");
const { ErrorHandler } = require("./errorHandler");
const { coloredLog } = require("./coloredLog");
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

//TODO: change model based on database type

app.oauth = new OAuth2Server({
  model: require("../config/oAuthModelConfForSQL"),
  // model: require("../config/oAuthModelConf"),
  accessTokenLifetime: process.env.ACCESS_TOKEN_LIFETIME || 60,
  // allowBearerTokensInQueryString: true,
});

let obtainToken = async (req, res) => {
  try {
    var request = new Request(req);
    var response = new Response(res);

    let token = await app.oauth.token(request, response).then((token) => {
      // console.log("TOKEN ------- ", token);
      return token;
    });

    return token;
  } catch (error) {
    if (error.code === 503) {
      throw new ErrorHandler("Credential not matched", 401);
    } else {
      throw new ErrorHandler(error.message, error.code);
    }
  }
};

let authenticateRequest = async (req, res) => {
  try {
    // const {accessToken} = req.body

    //   req.headers = {
    //     authorization: `Bearer ${accessToken}`
    //   }

    var request = new Request(req);
    var response = new Response(res);

    return app.oauth
      .authenticate(request, response)
      .then(function (token) {
        return true;
      })
      .catch((error) => {
        return false;
      });
  } catch (error) {
    return error;
  }
};

module.exports = {
  appOauth: app.oauth,
  obtainToken: obtainToken,
  tokenCheck: authenticateRequest,
};
