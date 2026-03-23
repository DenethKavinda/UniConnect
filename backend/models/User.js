const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  profilePicture: String,
  bio: String,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  // Password hashing logic
});

const User = mongoose.model('User', userSchema);

module.exports = User;
