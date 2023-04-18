const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    // required: true,
    // unique: true,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: "Please enter a valid email address",
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(?:\+?88)?01[3-9]\d{8}$/.test(v);
      },
      message: "Please enter a valid Bangladeshi phone number",
    },
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
});

userSchema.pre("save", async function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next();
  }

  // generate a salt
  const salt = await bcrypt.genSalt(10);

  // hash the password along with our new salt
  const hash = await bcrypt.hash(user.password, salt);

  // override the cleartext password with the hashed one
  user.password = hash;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
