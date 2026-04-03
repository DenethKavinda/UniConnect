const express = require('express');
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  votePost
} = require('../controllers/postController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', isLoggedIn, createPost);
router.put('/:id', isLoggedIn, updatePost);
router.delete('/:id', isLoggedIn, deletePost);
router.post('/:id/vote', isLoggedIn, votePost);

module.exports = router;
