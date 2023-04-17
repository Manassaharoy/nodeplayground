const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  age: {
    type: Number
  },
  address: {
    type: String
  },
  additionalData: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
