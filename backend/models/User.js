const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String },
  favorites: [{
    artistId: { type: String, required: true },
    name: String,
    birthday: String,
    deathday: String,
    nationality: String,
    thumbnail: String,
    addedAt: { type: Date, default: Date.now }
  }],
  notifications: [{
    type: { 
      type: String, 
      enum: ['LOGIN', 'LOGOUT', 'FAV_ADD', 'FAV_REMOVE', 'ACCOUNT_DELETE'] 
    },
    message: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }]
});

module.exports = mongoose.model('User', userSchema);