// Import the CryptoJS library
var CryptoJS = require('crypto-js');

// Define the encryption key and IV
var keyString = 'thisIsAverySpecialSecretKey00000';
var IV = '1583288699248111';

// Convert the key and IV to CryptoJS format
var key = CryptoJS.enc.Utf8.parse(keyString);
var iv = CryptoJS.enc.Utf8.parse(IV);

// Get the data to encrypt

data = {
    "name" : "hello"
}

var requestBody = JSON.stringify(data);

// Encrypt the request body using AES encryption
var encrypted = CryptoJS.AES.encrypt(requestBody, key, {
  iv: iv,
  padding: CryptoJS.pad.Pkcs7,
  mode: CryptoJS.mode.CBC
});

// Convert the encrypted data to a Base64-encoded string
var encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

// // Set the encrypted data as the request body
// request.data = encryptedBase64;

pm.variables.set("data", encryptedBase64)