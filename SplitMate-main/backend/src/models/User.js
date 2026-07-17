const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 60
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
