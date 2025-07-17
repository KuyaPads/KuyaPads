const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, groupSchemas } = require('../middleware/validation');

const router = express.Router();

// Create a new group
router.post('/', authenticateToken, validateRequest(groupSchemas.createGroup), async (req, res) => {
  try {
    const groupData = {
      ...req.body,
      creator: req.user._id,
      admins: [req.user._id],
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }]
    };

    const group = new Group(groupData);
    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id }
    });

    await group.populate('creator', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all groups (public groups + user's groups)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { privacy: 'public' },
        { 'members.user': req.user._id }
      ],
      isActive: true
    };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const groups = await Group.find(query)
      .populate('creator', 'username firstName lastName avatar')
      .populate('members.user', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Group.countDocuments(query);

    res.json({
      groups,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasMore: groups.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.getUserGroups(req.user._id);

    res.json({ groups });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific group
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'username firstName lastName avatar')
      .populate('admins', 'username firstName lastName avatar')
      .populate('moderators', 'username firstName lastName avatar')
      .populate('members.user', 'username firstName lastName avatar isOnline lastSeen');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user can view group
    if (!group.canView(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userRole = group.getMemberRole(req.user._id);

    res.json({ 
      group: {
        ...group.toObject(),
        userRole
      }
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a group
router.put('/:id', authenticateToken, validateRequest(groupSchemas.updateGroup), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can update the group' });
    }

    const allowedFields = ['name', 'description', 'privacy', 'category', 'tags', 'postingPermission', 'rules'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        group[field] = req.body[field];
      }
    });

    await group.save();

    await group.populate('creator', 'username firstName lastName avatar');

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a group
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can delete the group' });
    }

    // Remove group from all members' groups list
    await User.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    );

    // Delete all posts in the group
    await Post.deleteMany({ group: group._id });

    // Delete the group
    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a group
router.post('/:id/join', authenticateToken, validateRequest(groupSchemas.joinRequest), async (req, res) => {
  try {
    const { message } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    if (group.isMember(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Check if user already has a pending request
    const existingRequest = group.memberRequests.find(
      req => req.user.toString() === req.user._id.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request' });
    }

    if (group.privacy === 'public' && !group.settings.requireApproval) {
      // Auto-join for public groups
      group.members.push({
        user: req.user._id,
        role: 'member'
      });

      // Add group to user's groups
      await User.findByIdAndUpdate(req.user._id, {
        $push: { groups: group._id }
      });

      await group.save();

      res.json({ message: 'Successfully joined the group' });
    } else {
      // Add to member requests
      group.memberRequests.push({
        user: req.user._id,
        message,
        status: 'pending'
      });

      await group.save();

      res.json({ message: 'Join request sent successfully' });
    }
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a group
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.isMember(req.user._id)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    // Check if user is the creator
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave the group. Transfer ownership first or delete the group.' });
    }

    // Remove from members
    group.members = group.members.filter(member => member.user.toString() !== req.user._id.toString());
    
    // Remove from admins and moderators if applicable
    group.admins = group.admins.filter(admin => admin.toString() !== req.user._id.toString());
    group.moderators = group.moderators.filter(mod => mod.toString() !== req.user._id.toString());

    // Remove group from user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { groups: group._id }
    });

    await group.save();

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject member request
router.post('/:id/member-requests/:requestId/:action', authenticateToken, async (req, res) => {
  try {
    const { requestId, action } = req.params;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin or moderator
    if (!group.isModerator(req.user._id)) {
      return res.status(403).json({ message: 'Only admins and moderators can manage member requests' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const request = group.memberRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = action === 'approve' ? 'approved' : 'rejected';

    if (action === 'approve') {
      // Add to members
      group.members.push({
        user: request.user,
        role: 'member'
      });

      // Add group to user's groups
      await User.findByIdAndUpdate(request.user, {
        $push: { groups: group._id }
      });
    }

    await group.save();

    res.json({ message: `Member request ${action}d successfully` });
  } catch (error) {
    console.error('Process member request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group posts
router.get('/:id/posts', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user can view group
    if (!group.canView(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const posts = await Post.find({ group: req.params.id, isHidden: false })
      .populate('author', 'username firstName lastName avatar isVerified')
      .populate('comments.author', 'username firstName lastName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ group: req.params.id, isHidden: false });

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
    console.error('Get group posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manage member role
router.put('/:id/members/:userId/role', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can manage member roles' });
    }

    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find member
    const member = group.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Update member role
    member.role = role;

    // Update admins and moderators arrays
    group.admins = group.admins.filter(admin => admin.toString() !== userId);
    group.moderators = group.moderators.filter(mod => mod.toString() !== userId);

    if (role === 'admin') {
      group.admins.push(userId);
    } else if (role === 'moderator') {
      group.moderators.push(userId);
    }

    await group.save();

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Cannot remove the creator
    if (group.creator.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the group creator' });
    }

    // Remove from members
    group.members = group.members.filter(member => member.user.toString() !== userId);
    
    // Remove from admins and moderators
    group.admins = group.admins.filter(admin => admin.toString() !== userId);
    group.moderators = group.moderators.filter(mod => mod.toString() !== userId);

    // Remove group from user's groups
    await User.findByIdAndUpdate(userId, {
      $pull: { groups: group._id }
    });

    await group.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;