const express = require('express');
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

// Post routes

module.exports = router;
