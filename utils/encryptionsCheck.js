const CryptoJS = require("crypto-js");
const { coloredLog } = require("./coloredLog");

// Define the encryption key and IV
const keyString = process.env.KEY_STRING || "thisIsAverySpecialSecretKey00000";
const key = CryptoJS.SHA256(keyString);
const IV = process.env.IV || "1583288699248111";

//? Decryption middleware
const checkDecryption = (message) => {
  let msg;
  if (!message) msg = "hello";
  else msg = message;

  coloredLog(["Decryption started of ", msg], 4);

  const encryptedData = msg;

  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    iv: CryptoJS.enc.Utf8.parse(IV),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  let decrypetedData = decrypted.toString(CryptoJS.enc.Utf8);
  coloredLog(["Decrypted Data = ", decrypetedData], 4);
};

//? Encryption middleware
const checkEncryption = (message) => {
  let msg;
  if (!message) msg = "hello";
  else msg = message;

  coloredLog(
    [
      "Encryption started of message",
      JSON.stringify(msg),
      " type ",
      typeof msg,
    ],
    4
  );

  const requestBody = typeof msg === "object" ? JSON.stringify(msg) : msg;

  const encrypted = CryptoJS.AES.encrypt(requestBody, key, {
    iv: CryptoJS.enc.Utf8.parse(IV),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  let encryptedData = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  coloredLog(["Encrypted Data = ", encryptedData], 4);
};

module.exports = { checkEncryption, checkDecryption };
