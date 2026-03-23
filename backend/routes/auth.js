const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

// Auth routes

module.exports = router;
