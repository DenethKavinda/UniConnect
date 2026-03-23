const express = require('express');
const {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

// Comment routes

module.exports = router;
