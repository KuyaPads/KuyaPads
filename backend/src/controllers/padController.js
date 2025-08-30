const bcrypt = require('bcryptjs');
const Pad = require('../models/Pad');
const User = require('../models/User');
const { 
  createPadSchema, 
  updatePadSchema, 
  addCollaboratorSchema 
} = require('../middleware/validation');

const createPad = async (req, res, next) => {
  try {
    const { error, value } = createPadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, content, is_public, password } = value;
    
    const padData = {
      title,
      content: content || '',
      owner_id: req.user.id,
      is_public: is_public || false
    };

    // Hash password if provided
    if (password) {
      const saltRounds = 12;
      padData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    const pad = await Pad.create(padData);
    
    res.status(201).json({
      message: 'Pad created successfully',
      pad
    });
  } catch (error) {
    next(error);
  }
};

const getPads = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type = 'owned' } = req.query;

    let pads;
    switch (type) {
      case 'owned':
        pads = await Pad.findByOwner(userId);
        break;
      case 'collaborated':
        pads = await Pad.findByCollaborator(userId);
        break;
      case 'public':
        pads = await Pad.findPublic();
        break;
      default:
        return res.status(400).json({ error: 'Invalid pad type' });
    }

    res.json({ pads });
  } catch (error) {
    next(error);
  }
};

const getPad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pad = await Pad.findByIdWithOwner(id);

    if (!pad) {
      return res.status(404).json({ error: 'Pad not found' });
    }

    // Check permissions
    const isOwner = pad.owner_id === req.user.id;
    const isPublic = pad.is_public;
    
    if (!isOwner && !isPublic) {
      // Check if user is a collaborator
      const collaborators = await Pad.getCollaborators(id);
      const isCollaborator = collaborators.some(c => c.id === req.user.id);
      
      if (!isCollaborator) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get collaborators
    const collaborators = await Pad.getCollaborators(id);

    res.json({
      pad,
      collaborators
    });
  } catch (error) {
    next(error);
  }
};

const updatePad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updatePadSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const pad = await Pad.findById(id);
    if (!pad) {
      return res.status(404).json({ error: 'Pad not found' });
    }

    // Check if user has write permission
    const isOwner = pad.owner_id === req.user.id;
    if (!isOwner) {
      const collaborators = await Pad.getCollaborators(id);
      const collaborator = collaborators.find(c => c.id === req.user.id);
      
      if (!collaborator || collaborator.permission === 'read') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    const updateData = { ...value };
    
    // Handle password update
    if (value.password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(value.password, saltRounds);
      delete updateData.password;
    } else if (value.password === '' || value.password === null) {
      updateData.password_hash = null;
      delete updateData.password;
    }

    // Create version history if content changed
    if (value.content && value.content !== pad.content) {
      await Pad.createVersion({
        pad_id: id,
        content: pad.content,
        created_by: req.user.id,
        change_summary: `Updated by ${req.user.username}`
      });
    }

    const updatedPad = await Pad.update(id, updateData);
    
    res.json({
      message: 'Pad updated successfully',
      pad: updatedPad
    });
  } catch (error) {
    next(error);
  }
};

const deletePad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pad = await Pad.findById(id);

    if (!pad) {
      return res.status(404).json({ error: 'Pad not found' });
    }

    // Only owner can delete pad
    if (pad.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only pad owner can delete' });
    }

    await Pad.delete(id);
    
    res.json({ message: 'Pad deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addCollaborator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = addCollaboratorSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { user_id, permission } = value;

    const pad = await Pad.findById(id);
    if (!pad) {
      return res.status(404).json({ error: 'Pad not found' });
    }

    // Only owner can add collaborators
    if (pad.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only pad owner can add collaborators' });
    }

    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a collaborator
    const collaborators = await Pad.getCollaborators(id);
    const existingCollaborator = collaborators.find(c => c.id === user_id);
    
    if (existingCollaborator) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    await Pad.addCollaborator(id, user_id, permission);
    
    res.status(201).json({ 
      message: 'Collaborator added successfully' 
    });
  } catch (error) {
    next(error);
  }
};

const removeCollaborator = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const pad = await Pad.findById(id);
    if (!pad) {
      return res.status(404).json({ error: 'Pad not found' });
    }

    // Only owner can remove collaborators
    if (pad.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only pad owner can remove collaborators' });
    }

    await Pad.removeCollaborator(id, userId);
    
    res.json({ 
      message: 'Collaborator removed successfully' 
    });
  } catch (error) {
    next(error);
  }
};

const getVersions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pad = await Pad.findById(id);
    if (!pad) {
      return res.status(404).json({ error: 'Pad not found' });
    }

    // Check access permissions
    const isOwner = pad.owner_id === req.user.id;
    if (!isOwner) {
      const collaborators = await Pad.getCollaborators(id);
      const isCollaborator = collaborators.some(c => c.id === req.user.id);
      
      if (!isCollaborator && !pad.is_public) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const versions = await Pad.getVersions(id);
    
    res.json({ versions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPad,
  getPads,
  getPad,
  updatePad,
  deletePad,
  addCollaborator,
  removeCollaborator,
  getVersions
};