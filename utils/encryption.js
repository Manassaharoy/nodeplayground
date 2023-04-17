const CryptoJS = require("crypto-js");
const { coloredLog } = require("../utils/coloredLog");
const dotenv = require("dotenv").config();

// Define the encryption key and IV
const keyString = process.env.KEY_STRING || "thisIsAverySpecialSecretKey00000";
const IV = process.env.IV || "1583288699248111";

// Convert the key and IV to CryptoJS format
const key = CryptoJS.enc.Utf8.parse(keyString);
const iv = CryptoJS.enc.Utf8.parse(IV);

const ENCRYPTION_STATUS = process.env.ENCRYPTION_STATUS || "TRUE";

// Encryption function
function encryptData(data) {
  if (ENCRYPTION_STATUS === "TRUE") {
    coloredLog(["Encryption started"], 1);

    const response = JSON.stringify(data);

    // Encrypt the request body using AES encryption
    const encrypted = CryptoJS.AES.encrypt(response, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    // Convert the encrypted data to a Base64-encoded string
    const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    return encryptedBase64;
  } else {
    coloredLog("Encryption is off", 5);
    const response = data;
    return response;
  }
}

module.exports = encryptData;
