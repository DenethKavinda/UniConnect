const Post = require('../models/Post');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

const getAuthUserId = (user) => user?.userId || user?.id || user?._id || null;
const hasUserId = (ids, userId) => ids.some((id) => id.toString() === String(userId));
const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/posts - Get all posts with filtering, sorting, and pagination
const getAllPosts = async (req, res, next) => {
  try {
    const { subject, tag, sort = 'new', page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (subject && subject !== 'All') {
      filter.subject = subject;
    }
    if (tag) {
      const normalizedTag = String(tag).trim().replace(/^#/, '');
      if (normalizedTag) {
        filter.tags = { $elemMatch: { $regex: `^${escapeRegex(normalizedTag)}$`, $options: 'i' } };
      }
    }

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sort === 'top') {
      sortObj = { voteScore: -1 };
    } else if (sort === 'hot') {
      sortObj = { voteScore: -1, createdAt: -1 };
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch posts
    const posts = await Post.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('author', 'name')
      .lean();

    // Get total count for pagination
    const totalCount = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      posts,
      totalCount,
      page: pageNum,
      totalPages
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id - Get a single post by ID
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const post = await Post.findById(id)
      .populate('author', 'name')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// POST /api/posts - Create a new post (protected)
const createPost = async (req, res, next) => {
  try {
    const { title, content, subject, tags = '[]' } = req.body;
    const userId = getAuthUserId(req.user);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Parse tags from JSON string if needed
    let parsedTags = [];
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    } else {
      parsedTags = Array.isArray(tags) ? tags : [];
    }

    // Determine image: uploaded file or URL
    let imagePath = '';
    if (req.file) {
      // File was uploaded
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Create new post
    const newPost = new Post({
      title: title.trim(),
      content: content.trim(),
      author: userId,
      subject: subject || 'General',
      tags: parsedTags.filter(t => t && t.trim()),
      image: imagePath,
    });

    await newPost.save();
    await newPost.populate('author', 'name');

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

// PUT /api/posts/:id - Update a post (protected)
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, subject, tags, image } = req.body;
    const userId = getAuthUserId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check authorization
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Update fields
    if (typeof title === 'string' && title.trim()) post.title = title.trim();
    if (typeof content === 'string' && content.trim()) post.content = content.trim();
    if (subject !== undefined) post.subject = subject;
    
    // Handle tags - parse from JSON string if from FormData
    if (tags !== undefined) {
      let parsedTags = [];
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = [];
        }
      } else {
        parsedTags = Array.isArray(tags) ? tags : [];
      }
      post.tags = parsedTags.filter(t => t && t.trim());
    }
    
    // Handle image update
    if (req.file) {
      // File was uploaded
      post.image = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      // URL provided or cleared
      post.image = image;
    }

    await post.save();
    await post.populate('author', 'name');

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id - Delete a post (protected)
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getAuthUserId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check authorization
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete all comments for this post
    await Comment.deleteMany({ post: id });

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/vote - Vote on a post (protected)
const votePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up', 'down', or 'none'
    const userId = getAuthUserId(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!['up', 'down', 'none'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Handle vote toggle
    if (voteType === 'up') {
      // If already upvoted, remove the upvote
      if (hasUserId(post.upvotes, userId)) {
        post.upvotes = post.upvotes.filter(id => id.toString() !== String(userId));
      } else {
        // Add to upvotes and remove from downvotes
        post.upvotes.push(userId);
        post.downvotes = post.downvotes.filter(id => id.toString() !== String(userId));
      }
    } else if (voteType === 'down') {
      // If already downvoted, remove the downvote
      if (hasUserId(post.downvotes, userId)) {
        post.downvotes = post.downvotes.filter(id => id.toString() !== String(userId));
      } else {
        // Add to downvotes and remove from upvotes
        post.downvotes.push(userId);
        post.upvotes = post.upvotes.filter(id => id.toString() !== String(userId));
      }
    } else if (voteType === 'none') {
      // Remove from both
      post.upvotes = post.upvotes.filter(id => id.toString() !== String(userId));
      post.downvotes = post.downvotes.filter(id => id.toString() !== String(userId));
    }

    // Recalculate vote score
    post.voteScore = post.upvotes.length - post.downvotes.length;

    await post.save();

    // Determine current user's vote
    let userVote = 'none';
    if (hasUserId(post.upvotes, userId)) {
      userVote = 'up';
    } else if (hasUserId(post.downvotes, userId)) {
      userVote = 'down';
    }

    res.json({
      voteScore: post.voteScore,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      userVote
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  votePost
};
