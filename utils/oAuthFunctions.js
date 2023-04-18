//? Initialize express server
const express = require("express");
const app = express();

//! OAUTH
const OAuth2Server = require("oauth2-server");
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

app.oauth = new OAuth2Server({
  model: require("../config/oAuthModelConf"),
  accessTokenLifetime: process.env.ACCESS_TOKEN_LIFETIME || 20,
  // allowBearerTokensInQueryString: true,
});

let obtainToken = async (req, res) => {
  var request = new Request(req);
  var response = new Response(res);

  let token = await app.oauth.token(request, response).then((token) => {
    // console.log("TOKEN ------- ", token);
    return token;
  });
  return token;
};

let authenticateRequest = async (req, res) => {
  try {
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
