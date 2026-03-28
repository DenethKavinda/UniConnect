const Comment = require('../models/Comment');
const Post = require('../models/Post');
const mongoose = require('mongoose');

const getAuthUserId = (user) => user?.userId || user?.id || user?._id || null;
const hasUserId = (ids, userId) => ids.some((id) => id.toString() === String(userId));

// GET /api/comments/post/:postId - Get all comments for a post with tree structure
const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { sort = 'best' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    // Build sort object
    let sortObj = { voteScore: -1, createdAt: -1 }; // best
    if (sort === 'new') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'old') {
      sortObj = { createdAt: 1 };
    }

    // Fetch all comments for this post
    const comments = await Comment.find({ post: postId })
      .sort(sortObj)
      .populate('author', 'name')
      .lean();

    // Build tree structure
    const commentMap = {};
    const rootComments = [];

    // First pass: create comment objects and identify root comments
    comments.forEach(comment => {
      const id = String(comment._id);
      const normalizedComment = {
        ...comment,
        text: comment.isDeleted ? '[deleted]' : comment.text,
        author: comment.isDeleted ? null : comment.author,
        replies: []
      };

      commentMap[id] = normalizedComment;
      if (!comment.parentComment) {
        rootComments.push(normalizedComment);
      }
    });

    // Second pass: attach replies to their parents
    comments.forEach(comment => {
      if (comment.parentComment) {
        const parent = commentMap[String(comment.parentComment)];
        if (parent) {
          parent.replies.push(commentMap[String(comment._id)]);
        }
      }
    });

    res.json(rootComments);
  } catch (error) {
    next(error);
  }
};

// POST /api/comments - Create a new comment (protected)
const createComment = async (req, res, next) => {
  try {
    const { text, postId, parentCommentId } = req.body;
    const userId = getAuthUserId(req.user);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    // Validate text
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Check post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Calculate depth
    let depth = 0;
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return res.status(400).json({ message: 'Invalid parent comment id' });
      }

      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      if (String(parentComment.post) !== String(postId)) {
        return res.status(400).json({ message: 'Parent comment does not belong to this post' });
      }
      depth = Math.min(parentComment.depth + 1, 3);
    }

    // Create new comment
    const newComment = new Comment({
      text: text.trim(),
      author: userId,
      post: postId,
      parentComment: parentCommentId || null,
      depth
    });

    await newComment.save();
    await newComment.populate('author', 'name');

    // Increment post comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

// PUT /api/comments/:id - Update a comment (protected)
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = getAuthUserId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check authorization
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    // Update text
    if (typeof text === 'string' && text.trim()) {
      comment.text = text.trim();
    }

    await comment.save();
    await comment.populate('author', 'name');

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/comments/:id - Soft delete a comment (protected)
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getAuthUserId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check authorization
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.text = '[deleted]';
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/comments/:id/vote - Vote on a comment (protected)
const voteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up', 'down', or 'none'
    const userId = getAuthUserId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!['up', 'down', 'none'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Handle vote toggle
    if (voteType === 'up') {
      if (hasUserId(comment.upvotes, userId)) {
        comment.upvotes = comment.upvotes.filter(id => id.toString() !== String(userId));
      } else {
        comment.upvotes.push(userId);
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== String(userId));
      }
    } else if (voteType === 'down') {
      if (hasUserId(comment.downvotes, userId)) {
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== String(userId));
      } else {
        comment.downvotes.push(userId);
        comment.upvotes = comment.upvotes.filter(id => id.toString() !== String(userId));
      }
    } else if (voteType === 'none') {
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== String(userId));
      comment.downvotes = comment.downvotes.filter(id => id.toString() !== String(userId));
    }

    // Recalculate vote score
    comment.voteScore = comment.upvotes.length - comment.downvotes.length;

    await comment.save();

    // Determine current user's vote
    let userVote = 'none';
    if (hasUserId(comment.upvotes, userId)) {
      userVote = 'up';
    } else if (hasUserId(comment.downvotes, userId)) {
      userVote = 'down';
    }

    res.json({
      voteScore: comment.voteScore,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      userVote
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  voteComment
};
