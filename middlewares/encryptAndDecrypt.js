const CryptoJS = require("crypto-js");
// const { apiResponse } = require("../utils/apiResponse");
const { coloredLog } = require("../utils/coloredLog");
const dotenv = require("dotenv").config();

// Define the encryption key and IV
const keyString = process.env.KEY_STRING || "thisIsAverySpecialSecretKey00000";
const IV = process.env.IV || "1583288699248111";

// Convert the key and IV to CryptoJS format
const key = CryptoJS.enc.Utf8.parse(keyString);
const iv = CryptoJS.enc.Utf8.parse(IV);

const ENCRYPTION_STATUS = process.env.ENCRYPTION_STATUS || "TRUE";

//? Decryption middleware
const decryptionMiddleware = (req, res, next) => {
  if (ENCRYPTION_STATUS === "TRUE") {
    coloredLog(["Decryption started"], 5);
    // coloredLog(["req.body", typeof(req.body), JSON.stringify(req.body)], 5);

    if(req.method === "GET"){
      console.log("ITS A GET");
      next();
    }

    // Get the encrypted request body from the request
    const encryptedBase64 = req.body.data;
    
    // Convert the encrypted data from a Base64-encoded string to CryptoJS format
    const encryptedData = CryptoJS.enc.Base64.parse(encryptedBase64);
    
    // Decrypt the request body using AES decryption
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedData }, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    
    // Convert the decrypted data to a string and parse it as JSON
    const decryptedBody = decrypted.toString(CryptoJS.enc.Utf8);
    // coloredLog(["decryptedBody ------- ", decryptedBody], 5);
    
    if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
      // coloredLog(["Decrypted Data is object"], 5);
    } else {
      req.body = decryptedBody;
      // coloredLog(["Decrypted Data is string "], 5);
    }
    next();
  } else {
    coloredLog("Decryption is off", 5);
    next();
  }
};

//? Encryption middleware
function encryptionMiddleware(req, res, next) {
  coloredLog("Inside encryptionMiddleware", 6);
  if (ENCRYPTION_STATUS === "TRUE") {
    coloredLog(
      [
        "Encryption started",
        "type of",
        typeof res.locals.sendData,
        `${JSON.stringify(res.locals.sendData)}`,
      ],
      1
    );

    // Get the request body as a string
    let requestBody = JSON.stringify(res.locals.sendData);

    // const response = JSON.stringify(apiResponse(true, requestBody));

    // Encrypt the request body using AES encryption
    const encrypted = CryptoJS.AES.encrypt(response, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    // Convert the encrypted data to a Base64-encoded string
    const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    // Set the encrypted data as the request body
    let encryptedData = encryptedBase64;

    coloredLog(["encrypted data: ", encryptedData], 1);

    res.locals = { myData: encryptedData };
    next();
  } else {
    coloredLog("Encryption is off", 5);
    // const response = apiResponse(true, res.locals.sendData);
    res.locals = { myData: response };

    next();
  }
}

//? Encryption middleware
function encryptionMiddlewareForError(req, res, next) {
  coloredLog("Inside encryptionMiddlewareForError", 6);
  if (ENCRYPTION_STATUS === "TRUE") {
    coloredLog(
      [
        "Encryption started",
        "type of",
        typeof res.locals.sendData,
        `${JSON.stringify(res.locals.sendData)}`,
      ],
      1
    );

    // Get the request body as a string
    let requestBody = JSON.stringify(res.locals.sendData);

    // const response = JSON.stringify(apiResponse(true, requestBody));

    // Encrypt the request body using AES encryption
    const encrypted = CryptoJS.AES.encrypt(requestBody, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    // Convert the encrypted data to a Base64-encoded string
    const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    // Set the encrypted data as the request body
    let encryptedData = encryptedBase64;

    coloredLog(["encrypted data: ", encryptedData], 1);

    res.locals = { myData: encryptedData };
    next();
  } else {
    coloredLog("Encryption is off on error", 5);

    res.locals = { myData: res.locals.sendData };

    next();
  }
}

module.exports = {
  encryptionMiddleware,
  decryptionMiddleware,
  encryptionMiddlewareForError,
};
