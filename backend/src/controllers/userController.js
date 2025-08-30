const User = require('../models/User');
const { updateUserSchema } = require('../middleware/validation');

const getProfile = async (req, res, next) => {
  try {
    const { password_hash: _, ...userResponse } = req.user;
    res.json({ user: userResponse });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedUser = await User.update(req.user.id, value);
    const { password_hash: _, ...userResponse } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAll();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password_hash: _, ...userResponse } = user;
    res.json({ user: userResponse });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById
};