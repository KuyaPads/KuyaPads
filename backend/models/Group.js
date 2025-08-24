const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  avatar: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  memberRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public'
  },
  postingPermission: {
    type: String,
    enum: ['all', 'admins_only', 'admins_and_moderators'],
    default: 'all'
  },
  category: {
    type: String,
    enum: ['general', 'business', 'education', 'entertainment', 'sports', 'technology', 'travel', 'food', 'arts', 'politics', 'other'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  rules: [{
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      maxlength: 500
    }
  }],
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowDiscussions: {
      type: Boolean,
      default: true
    },
    allowFiles: {
      type: Boolean,
      default: true
    },
    allowPolls: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalPosts: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better performance
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ category: 1 });
groupSchema.index({ privacy: 1 });
groupSchema.index({ creator: 1 });
groupSchema.index({ 'members.user': 1 });

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if user is a member
groupSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if user is an admin
groupSchema.methods.isAdmin = function(userId) {
  return this.admins.includes(userId) || this.creator.toString() === userId.toString();
};

// Method to check if user is a moderator
groupSchema.methods.isModerator = function(userId) {
  return this.moderators.includes(userId) || this.isAdmin(userId);
};

// Method to check if user can post
groupSchema.methods.canPost = function(userId) {
  if (this.postingPermission === 'all') return this.isMember(userId);
  if (this.postingPermission === 'admins_only') return this.isAdmin(userId);
  if (this.postingPermission === 'admins_and_moderators') return this.isModerator(userId);
  return false;
};

// Method to check if user can view group
groupSchema.methods.canView = function(userId) {
  if (this.privacy === 'public') return true;
  if (this.privacy === 'private') return this.isMember(userId);
  if (this.privacy === 'secret') return this.isMember(userId);
  return false;
};

// Method to get member role
groupSchema.methods.getMemberRole = function(userId) {
  if (this.creator.toString() === userId.toString()) return 'creator';
  if (this.admins.includes(userId)) return 'admin';
  if (this.moderators.includes(userId)) return 'moderator';
  if (this.isMember(userId)) return 'member';
  return null;
};

// Static method to get user's groups
groupSchema.statics.getUserGroups = function(userId) {
  return this.find({
    'members.user': userId,
    isActive: true
  })
  .populate('creator', 'username firstName lastName avatar')
  .sort({ name: 1 });
};

// Update member count when members change
groupSchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.stats.totalMembers = this.members.length;
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);