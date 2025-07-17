const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateRequest, postSchemas } = require('../middleware/validation');

const router = express.Router();

// Create a new post
router.post('/', authenticateToken, validateRequest(postSchemas.createPost), async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author: req.user._id
    };

    const post = new Post(postData);
    await post.save();

    await post.populate('author', 'username firstName lastName avatar isVerified');
    if (post.group) {
      await post.populate('group', 'name avatar');
    }

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feed posts
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const currentUser = await User.findById(req.user._id);
    
    const posts = await Post.getFeedPosts(
      req.user._id,
      currentUser.friends,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar isVerified')
      .populate('group', 'name avatar')
      .populate('comments.author', 'username firstName lastName avatar isVerified')
      .populate('comments.replies.author', 'username firstName lastName avatar isVerified');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can view the post
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      const canView = post.canViewBy(req.user._id, currentUser.friends);
      
      if (!canView) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (post.privacy !== 'public') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a post
router.put('/:id', authenticateToken, validateRequest(postSchemas.updatePost), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Save original content for edit history
    if (req.body.content) {
      post.editHistory.push({
        content: post.content,
        editedAt: new Date()
      });
      post.isEdited = true;
    }

    // Update fields
    const allowedFields = ['content', 'privacy', 'tags'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();

    await post.populate('author', 'username firstName lastName avatar isVerified');
    if (post.group) {
      await post.populate('group', 'name avatar');
    }

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.isLikedBy(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(like => like.user.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, validateRequest(postSchemas.addComment), async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (parentComment) {
      // Reply to comment
      const comment = post.comments.id(parentComment);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      comment.replies.push({
        author: req.user._id,
        content
      });
    } else {
      // New comment
      post.comments.push({
        author: req.user._id,
        content
      });
    }

    await post.save();

    await post.populate('comments.author', 'username firstName lastName avatar isVerified');
    await post.populate('comments.replies.author', 'username firstName lastName avatar isVerified');

    res.status(201).json({
      message: 'Comment added successfully',
      comments: post.comments
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a comment
router.post('/:postId/comments/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isLiked = comment.likes.some(like => like.user.toString() === req.user._id.toString());

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.user.toString() !== req.user._id.toString());
    } else {
      // Like
      comment.likes.push({ user: req.user._id });
    }

    await post.save();

    res.json({
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      isLiked: !isLiked,
      likeCount: comment.likes.length
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share a post
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const { comment } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already shared
    const hasShared = post.shares.some(share => share.user.toString() === req.user._id.toString());
    if (hasShared) {
      return res.status(400).json({ message: 'Post already shared' });
    }

    post.shares.push({
      user: req.user._id,
      comment
    });

    await post.save();

    res.json({
      message: 'Post shared successfully',
      shareCount: post.shares.length
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report a post
router.post('/:id/report', authenticateToken, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reported this post
    const hasReported = post.reports.some(report => report.user.toString() === req.user._id.toString());
    if (hasReported) {
      return res.status(400).json({ message: 'Post already reported' });
    }

    post.reports.push({
      user: req.user._id,
      reason,
      description
    });

    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build query based on privacy and relationship
    let query = { author: userId, isHidden: false };
    
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      const isFriend = currentUser.friends.includes(userId);
      const isOwner = req.user._id.toString() === userId;

      if (!isOwner) {
        if (isFriend) {
          query.privacy = { $in: ['public', 'friends'] };
        } else {
          query.privacy = 'public';
        }
      }
    } else {
      query.privacy = 'public';
    }

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar isVerified')
      .populate('group', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;