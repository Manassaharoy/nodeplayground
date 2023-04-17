const CryptoJS = require("crypto-js");
const { coloredLog } = require("../utils/coloredLog");
const dotenv = require("dotenv").config();

// Define the encryption key and IV
const keyString = process.env.KEY_STRING || "thisIsAverySpecialSecretKey00000";
const key = CryptoJS.SHA256(keyString);
const IV = process.env.IV || "1583288699248111";

const ENCRYPTION_STATUS = process.env.ENCRYPTION_STATUS || "TRUE";

//? Decryption middleware
const decryptionMiddleware = (req, res, next) => {
  if (ENCRYPTION_STATUS === "TRUE") {
    coloredLog("SHA256 Decryption started", 5);

    const encryptedData = req.body.data; // req body data decryption
    // const encryptedData = "ahsLOjZXgs+FLnb0uYnQ5BH30nzcK6Lw+sDgnAl0qnQ="; // dummy data decryption

    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: CryptoJS.enc.Utf8.parse(IV),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    req.body = decrypted.toString(CryptoJS.enc.Utf8);
    if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
      coloredLog(["Decrypted Data is object = ", `${req.body}`], 5);
    } else {
      coloredLog(["Decrypted Data is string = ", `${req.body}`], 5);
    }
    next();
  } else {
    coloredLog("Decryption is off", 5)
    next();
  }
};

//? Encryption middleware
function encryptionMiddleware(req, res, next) {
  if (ENCRYPTION_STATUS === "TRUE") {
    coloredLog(["Encryption started for req body", req.body], 1);
    const requestBody = JSON.stringify(req.body);

    const encrypted = CryptoJS.AES.encrypt(requestBody, key, {
      iv: CryptoJS.enc.Utf8.parse(IV),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    let encryptedData = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    coloredLog(["Encrypted Data = ", req.body], 1);

    req.locals = { myData: encryptedData };
    next();
  } else {
    coloredLog("Encryption is off", 5)
    req.locals = { myData: req.body };

    next();
  }
}

module.exports = { encryptionMiddleware, decryptionMiddleware };
