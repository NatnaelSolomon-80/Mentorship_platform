const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { checkBlock } = require('../middleware/blockMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, checkBlock, getMe);
router.put('/profile', protect, checkBlock, updateProfile);

module.exports = router;
