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

// Decryption function
function decryptData(encryptedBase64) {
  if (ENCRYPTION_STATUS === "TRUE") {
    coloredLog(["Decryption started"], 5);
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

    return decryptedBody;
  } else {
    coloredLog("Decryption is off", 5);
    return encryptedBase64;
  }
}

module.exports = decryptData;
