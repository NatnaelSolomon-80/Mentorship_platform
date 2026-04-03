const User = require('../models/User');

// @desc   Get all users (admin)
// @route  GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { role, isApproved } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single user
// @route  GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Submit onboarding profile (mentor or employer)
// @route  POST /api/users/submit-profile
const submitProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!['mentor', 'employer'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Only mentors and employers can submit profiles' });
    }

    user.profileSubmission = req.body;
    user.submissionStatus = 'submitted';
    user.rejectionReason = '';
    await user.save();

    res.json({
      success: true,
      message: 'Profile submitted for admin review',
      data: { submissionStatus: user.submissionStatus },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Approve user (admin)
// @route  PATCH /api/users/:id/approve
const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, submissionStatus: 'approved', rejectionReason: '' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User approved', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reject user with reason (admin)
// @route  PATCH /api/users/:id/reject
const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        submissionStatus: 'rejected',
        rejectionReason: reason || 'Your application was rejected. Please resubmit with complete information.',
      },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User rejected', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Block / Unblock user (admin)
// @route  PATCH /api/users/:id/block
const toggleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot block admin' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete user (admin)
// @route  DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get approved mentors (public)
// @route  GET /api/users/mentors
const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor', isApproved: true, isBlocked: false })
      .select('name email avatar bio skills yearsOfExperience rating reviewCount');
    res.json({ success: true, data: mentors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, submitProfile, approveUser, rejectUser, toggleBlock, deleteUser, getMentors };
