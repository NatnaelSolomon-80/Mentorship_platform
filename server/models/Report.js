const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, enum: ['lesson', 'module', 'course'], default: 'lesson' },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
