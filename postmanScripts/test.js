// Import the CryptoJS library
var CryptoJS = require('crypto-js');

// Define the encryption key and IV
var keyString = 'thisIsAverySpecialSecretKey00000';
var IV = '1583288699248111';

// Convert the key and IV to CryptoJS format
var key = CryptoJS.enc.Utf8.parse(keyString);
var iv = CryptoJS.enc.Utf8.parse(IV);

// Convert the Base64-encoded string to ciphertext
console.info("response from server", pm.response.json().encoded)
var ciphertext = CryptoJS.enc.Base64.parse(pm.response.json().encoded);

// Decrypt the ciphertext using AES encryption
var decrypted = CryptoJS.AES.decrypt({
  ciphertext: ciphertext
}, key, {
  iv: iv,
  padding: CryptoJS.pad.Pkcs7,
  mode: CryptoJS.mode.CBC
});

// Convert the decrypted data to a string
var decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

console.log(decryptedString);

pm.test("response data: "+decryptedString, function () {
    pm.response.to.have.status(200);
});
