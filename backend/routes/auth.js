// const express = require('express');
// const { register, login, logout } = require('../controllers/authController');
// const { isLoggedIn } = require('../middleware/auth');

// const router = express.Router();

// // Auth routes

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

module.exports = router;