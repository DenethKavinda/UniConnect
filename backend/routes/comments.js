const express = require('express');
const {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  voteComment
} = require('../controllers/commentController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

router.get('/post/:postId', getCommentsByPost);
router.post('/', isLoggedIn, createComment);
router.put('/:id', isLoggedIn, updateComment);
router.delete('/:id', isLoggedIn, deleteComment);
router.post('/:id/vote', isLoggedIn, voteComment);

module.exports = router;
