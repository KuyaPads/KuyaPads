const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, userSchemas } = require('../middleware/validation');

const router = express.Router();

// Get user profile by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy settings
    const canViewProfile = user.settings.privacy.profileVisibility === 'public' ||
                          (user.settings.privacy.profileVisibility === 'friends' && 
                           user.friends.includes(req.user._id)) ||
                          user._id.toString() === req.user._id.toString();

    if (!canViewProfile) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateRequest(userSchemas.updateProfile), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const allowedFields = ['firstName', 'lastName', 'bio', 'location', 'birthDate', 'gender'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/settings', authenticateToken, validateRequest(userSchemas.updateSettings), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (req.body.privacy) {
      user.settings.privacy = { ...user.settings.privacy, ...req.body.privacy };
    }
    
    if (req.body.notifications) {
      user.settings.notifications = { ...user.settings.notifications, ...req.body.notifications };
    }

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { 
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: query,
              options: 'i'
            }
          }
        }
      ],
      'settings.privacy.profileVisibility': { $in: ['public', 'friends'] }
    })
    .select('username firstName lastName avatar bio location isVerified isOnline lastSeen')
    .skip(skip)
    .limit(parseInt(limit));

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { 
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: query,
              options: 'i'
            }
          }
        }
      ],
      'settings.privacy.profileVisibility': { $in: ['public', 'friends'] }
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send friend request
router.post('/friend-request/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (targetUser.friends.includes(currentUserId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if friend request already exists
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === currentUserId.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if user allows friend requests
    if (!targetUser.settings.privacy.allowFriendRequests) {
      return res.status(403).json({ message: 'User does not accept friend requests' });
    }

    // Add friend request
    targetUser.friendRequests.push({
      from: currentUserId,
      status: 'pending'
    });

    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to friend request
router.post('/friend-request/:requestId/:action', authenticateToken, async (req, res) => {
  try {
    const { requestId, action } = req.params;
    const currentUserId = req.user._id;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const user = await User.findById(currentUserId);
    const friendRequest = user.friendRequests.id(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request already processed' });
    }

    friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';

    if (action === 'accept') {
      // Add to friends list
      user.friends.push(friendRequest.from);
      
      // Add current user to friend's friend list
      const friend = await User.findById(friendRequest.from);
      friend.friends.push(currentUserId);
      await friend.save();
    }

    await user.save();

    res.json({ message: `Friend request ${action}ed successfully` });
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friend requests
router.get('/friend-requests', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'username firstName lastName avatar isVerified');

    const pendingRequests = user.friendRequests.filter(req => req.status === 'pending');

    res.json({ friendRequests: pendingRequests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove friend
router.delete('/friend/:friendId', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Remove from current user's friends
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    
    // Remove from friend's friends
    friend.friends = friend.friends.filter(id => id.toString() !== currentUserId.toString());

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's friends
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username firstName lastName avatar bio location isVerified isOnline lastSeen');

    res.json({ friends: user.friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's friends (by user ID)
router.get('/:userId/friends', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current user can view friends list
    const canViewFriends = user.settings.privacy.profileVisibility === 'public' ||
                          (user.settings.privacy.profileVisibility === 'friends' && 
                           user.friends.includes(req.user._id)) ||
                          user._id.toString() === req.user._id.toString();

    if (!canViewFriends) {
      return res.status(403).json({ message: 'Friends list is private' });
    }

    await user.populate('friends', 'username firstName lastName avatar bio location isVerified isOnline lastSeen');

    res.json({ friends: user.friends });
  } catch (error) {
    console.error('Get user friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;