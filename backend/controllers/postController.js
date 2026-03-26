const Post = require('../models/Post');
const Comment = require('../models/Comment');

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
      filter.tags = { $in: [tag] };
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
      .populate('author', 'name profilePicture')
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
    const post = await Post.findById(id)
      .populate('author', 'name profilePicture')
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
    const { title, content, subject, tags = [], image } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Create new post
    const newPost = new Post({
      title: title.trim(),
      content: content.trim(),
      author: userId,
      subject: subject || 'General',
      tags: Array.isArray(tags) ? tags.filter(t => t && t.trim()) : [],
      image: image || '',
    });

    await newPost.save();
    await newPost.populate('author', 'name profilePicture');

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
    const userId = req.user.userId;

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
    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (subject !== undefined) post.subject = subject;
    if (tags) post.tags = Array.isArray(tags) ? tags.filter(t => t && t.trim()) : [];
    if (image !== undefined) post.image = image;

    await post.save();
    await post.populate('author', 'name profilePicture');

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id - Delete a post (protected)
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

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
    const userId = req.user.userId;

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Handle vote toggle
    if (voteType === 'up') {
      // If already upvoted, remove the upvote
      if (post.upvotes.includes(userId)) {
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
      } else {
        // Add to upvotes and remove from downvotes
        post.upvotes.push(userId);
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
      }
    } else if (voteType === 'down') {
      // If already downvoted, remove the downvote
      if (post.downvotes.includes(userId)) {
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
      } else {
        // Add to downvotes and remove from upvotes
        post.downvotes.push(userId);
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
      }
    } else if (voteType === 'none') {
      // Remove from both
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
      post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
    }

    // Recalculate vote score
    post.voteScore = post.upvotes.length - post.downvotes.length;

    await post.save();

    // Determine current user's vote
    let userVote = 'none';
    if (post.upvotes.includes(userId)) {
      userVote = 'up';
    } else if (post.downvotes.includes(userId)) {
      userVote = 'down';
    }

    res.json({
      voteScore: post.voteScore,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
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
