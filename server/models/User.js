const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['student', 'mentor', 'employer', 'admin'],
    required: true,
  },
  isApproved: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  yearsOfExperience: { type: Number, default: 0 },
  githubUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // Onboarding flow for mentor & employer
  submissionStatus: {
    type: String,
    enum: ['not_submitted', 'submitted', 'approved', 'rejected'],
    default: 'not_submitted',
  },
  rejectionReason: { type: String, default: '' },
  profileSubmission: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

// Auto-approve students on creation (admin is seeded directly, no pre-save)
userSchema.pre('save', async function (next) {
  if (this.role === 'student') this.isApproved = true;
  if (this.role === 'admin') this.isApproved = true;

  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
