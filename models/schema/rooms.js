const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    members: {
      type: Array,
    },
    message: {
      type: Array,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    // Add expires field to automatically delete the document after 1 hour
    expires: 3600, // Time in seconds (1 hour = 3600 seconds)
  }
);

module.exports = mongoose.model("Room", roomSchema);
