const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  accessToken: String,
  accessTokenExpiresAt: {
    type: Date,
    default: Date.now
  },
  refreshToken: String,
  refreshTokenExpiresAt: {
	type: Date
  },
  expiryTime: String,
  expiryStatus: Boolean,
  client: Object,
  user: Object,
});

// tokenSchema.index({ "refreshTokenExpiresAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Token", tokenSchema);
