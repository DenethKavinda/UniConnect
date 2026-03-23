const express = require('express');
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

// User routes

module.exports = router;
