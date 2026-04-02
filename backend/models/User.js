// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // User schema

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   profilePicture: String,
//   bio: String,
//   createdAt: { type: Date, default: Date.now }
// });

// // Hash password before saving

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   // Password hashing logic
// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);