const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;