const express = require('express');
const router = express.Router();
const {
  createPad,
  getPads,
  getPad,
  updatePad,
  deletePad,
  addCollaborator,
  removeCollaborator,
  getVersions
} = require('../controllers/padController');
const { authenticateToken } = require('../middleware/auth');

// All pad routes require authentication
router.use(authenticateToken);

router.post('/', createPad);
router.get('/', getPads);
router.get('/:id', getPad);
router.put('/:id', updatePad);
router.delete('/:id', deletePad);
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);
router.get('/:id/versions', getVersions);

module.exports = router;