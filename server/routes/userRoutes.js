const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, submitProfile,
  approveUser, rejectUser, toggleBlock, deleteUser, getMentors
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { checkBlock } = require('../middleware/blockMiddleware');

// Public — list available mentors
router.get('/mentors', protect, getMentors);

// Mentor/Employer — submit onboarding profile
router.post('/submit-profile', protect, checkBlock, authorizeRoles('mentor', 'employer'), submitProfile);

// Admin only
router.get('/', protect, checkBlock, authorizeRoles('admin'), getAllUsers);
router.get('/:id', protect, checkBlock, getUserById);
router.patch('/:id/approve', protect, checkBlock, authorizeRoles('admin'), approveUser);
router.patch('/:id/reject', protect, checkBlock, authorizeRoles('admin'), rejectUser);
router.patch('/:id/block', protect, checkBlock, authorizeRoles('admin'), toggleBlock);
router.delete('/:id', protect, checkBlock, authorizeRoles('admin'), deleteUser);

module.exports = router;
