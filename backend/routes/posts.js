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
const { uploadPostImage } = require('../config/multer');

const router = express.Router();

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size must be less than 5MB' });
    }
    if (err.code === 'LIMIT_PART_COUNT' || err.message.includes('Only image files')) {
      return res.status(400).json({ message: err.message || 'Invalid file' });
    }
  }
  next(err);
};

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', isLoggedIn, uploadPostImage.single('image'), handleMulterError, createPost);
router.put('/:id', isLoggedIn, uploadPostImage.single('image'), handleMulterError, updatePost);
router.delete('/:id', isLoggedIn, deletePost);
router.post('/:id/vote', isLoggedIn, votePost);

module.exports = router;
