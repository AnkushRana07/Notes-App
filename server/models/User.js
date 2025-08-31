const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    default: ''
  },
  provider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  picture: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);