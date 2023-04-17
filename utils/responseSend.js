const HttpErrors = require("../data/httpErrors");
const { coloredLog } = require("./coloredLog");
const decryptData = require("./decryption");
const encryptData = require("./encryption");
const generateRandomNumber = require("./randomNumber");

function responseSend(res, data) {
 
  let response = {};

  response = {
    success: true,
    data: data,
    isError: false,
    error: null,
  };

  let encrpted = encryptData(response);

  const responseObject = {
    encoded: encrpted,
    jrn: generateRandomNumber(),
  };

  coloredLog(["Response sent ---->"], 6);

  res.json(responseObject);
}

module.exports = responseSend;
