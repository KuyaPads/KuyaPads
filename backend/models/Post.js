const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      required: true,
      maxlength: 5000
    },
    images: [{
      url: String,
      caption: String
    }],
    videos: [{
      url: String,
      caption: String,
      thumbnail: String
    }]
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'link', 'poll'],
    default: 'text'
  },
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 1000
      },
      likes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'inappropriate', 'fake_news', 'other'],
      required: true
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  hiddenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hiddenAt: Date
}, {
  timestamps: true
});

// Index for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ privacy: 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to check if user can view the post
postSchema.methods.canViewBy = function(userId, userFriends = []) {
  if (this.privacy === 'public') return true;
  if (this.privacy === 'private') return this.author.toString() === userId.toString();
  if (this.privacy === 'friends') {
    return this.author.toString() === userId.toString() || 
           userFriends.includes(this.author.toString());
  }
  return false;
};

// Static method to get feed posts
postSchema.statics.getFeedPosts = function(userId, userFriends = [], page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { author: userId },
      { author: { $in: userFriends }, privacy: { $in: ['public', 'friends'] } },
      { privacy: 'public' }
    ],
    isHidden: false
  })
  .populate('author', 'username firstName lastName avatar isVerified')
  .populate('group', 'name avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Post', postSchema);