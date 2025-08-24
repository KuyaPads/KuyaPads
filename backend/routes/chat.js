const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, messageSchemas } = require('../middleware/validation');

const router = express.Router();

// Send a message
router.post('/', authenticateToken, validateRequest(messageSchemas.sendMessage), async (req, res) => {
  try {
    const { recipient, group, content, type, replyTo } = req.body;

    // Validate recipient or group
    if (recipient) {
      const recipientUser = await User.findById(recipient);
      if (!recipientUser) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
    }

    if (group) {
      const Group = require('../models/Group');
      const groupDoc = await Group.findById(group);
      if (!groupDoc) {
        return res.status(404).json({ message: 'Group not found' });
      }
      
      // Check if user is a member of the group
      if (!groupDoc.isMember(req.user._id)) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }
    }

    const message = new Message({
      sender: req.user._id,
      recipient,
      group,
      content,
      type,
      replyTo
    });

    await message.save();

    await message.populate('sender', 'username firstName lastName avatar isOnline');
    if (recipient) {
      await message.populate('recipient', 'username firstName lastName avatar isOnline');
    }
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation with a user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const messages = await Message.getConversation(
      req.user._id,
      userId,
      parseInt(page),
      parseInt(limit)
    );

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group messages
router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const Group = require('../models/Group');
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.isMember(req.user._id)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const messages = await Message.getGroupMessages(
      groupId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user._id);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a message
router.put('/:messageId', authenticateToken, validateRequest(messageSchemas.updateMessage), async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user can edit message
    if (!message.canEdit(req.user._id)) {
      return res.status(403).json({ message: 'Cannot edit this message' });
    }

    // Save original content to edit history
    message.editHistory.push({
      content: message.content,
      editedAt: new Date()
    });

    message.content = content;
    message.isEdited = true;

    await message.save();

    await message.populate('sender', 'username firstName lastName avatar isOnline');
    if (message.recipient) {
      await message.populate('recipient', 'username firstName lastName avatar isOnline');
    }

    res.json({
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user can delete message
    if (!message.canDelete(req.user._id)) {
      return res.status(403).json({ message: 'Cannot delete this message' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = req.user._id;

    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction to message
router.post('/:messageId/reaction', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        r => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({
        user: req.user._id,
        emoji
      });
    }

    await message.save();

    res.json({
      message: existingReaction ? 'Reaction removed' : 'Reaction added',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.post('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'Message IDs are required' });
    }

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        recipient: req.user._id
      },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search messages
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, userId, groupId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let query = {
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ],
      'content.text': { $regex: q, $options: 'i' },
      isDeleted: false
    };

    if (userId) {
      query = {
        ...query,
        $or: [
          { sender: req.user._id, recipient: userId },
          { sender: userId, recipient: req.user._id }
        ]
      };
    }

    if (groupId) {
      query = {
        ...query,
        group: groupId
      };
      delete query.$or; // Remove the sender/recipient filter for group messages
    }

    const messages = await Message.find(query)
      .populate('sender', 'username firstName lastName avatar')
      .populate('recipient', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;