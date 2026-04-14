const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!['student', 'mentor', 'employer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password, role });

    // Issue a token for ALL roles so everyone can access their dashboard.
    // isApproved=false for mentors/employers — the dashboard shows a pending banner.
    res.status(201).json({
      success: true,
      message:
        role === 'student'
          ? 'Account created! Welcome to SkillBridge 🎉'
          : 'Registration submitted! You can explore your dashboard while we review your account.',
      token: generateToken(user._id),
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user including admin
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact admin.' });
    }
    // Note: unapproved mentors/employers CAN log in — the dashboard shows a pending banner.

    res.json({
      success: true,
      token: generateToken(user._id),
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      skills,
      avatar,
      githubUrl,
      portfolioUrl,
      yearsOfExperience,
      experienceLevel,
    } = req.body;

    const updates = {};

    if (typeof name === 'string') updates.name = name.trim();
    if (typeof bio === 'string') updates.bio = bio;
    if (Array.isArray(skills)) {
      updates.skills = skills
        .map((skill) => (typeof skill === 'string' ? skill.trim() : ''))
        .filter(Boolean);
    }
    if (typeof avatar === 'string') updates.avatar = avatar;
    if (typeof githubUrl === 'string') updates.githubUrl = githubUrl.trim();
    if (typeof portfolioUrl === 'string') updates.portfolioUrl = portfolioUrl.trim();
    if (typeof yearsOfExperience === 'number' && yearsOfExperience >= 0) {
      updates.yearsOfExperience = yearsOfExperience;
    }
    if (['Beginner', 'Intermediate', 'Advanced'].includes(experienceLevel)) {
      updates.experienceLevel = experienceLevel;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
