const CertificateRequest = require('../models/CertificateRequest');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Test = require('../models/Test');
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const { generateCertificateHTML } = require('../utils/generateCertificate');

// @desc   Request certificate
// @route  POST /api/certificates/request
const requestCertificate = async (req, res) => {
  try {
    const { courseId, mentorId } = req.body;

    // Check progress — all modules done
    const progress = await Progress.findOne({ studentId: req.user._id, courseId });
    const course = await Course.findById(courseId).populate('modules');

    if (!progress || progress.completedModules.length < course.modules.length) {
      return res.status(400).json({ success: false, message: 'Complete all modules first' });
    }

    // Check final test passed
    const finalTest = await Test.findOne({ courseId, type: 'final' });
    if (finalTest) {
      const result = await Result.findOne({ studentId: req.user._id, testId: finalTest._id, passed: true });
      if (!result) {
        return res.status(400).json({ success: false, message: 'Pass the final test first (≥70%)' });
      }
    }

    // Check existing request
    const existing = await CertificateRequest.findOne({ studentId: req.user._id, courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Certificate request already submitted', data: existing });
    }

    const certRequest = await CertificateRequest.create({
      studentId: req.user._id,
      courseId,
      mentorId,
    });

    res.status(201).json({ success: true, data: certRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Mentor approves/rejects certificate request
// @route  PATCH /api/certificates/request/:id
const respondToCertificateRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const certRequest = await CertificateRequest.findById(req.params.id)
      .populate('studentId', 'name')
      .populate('courseId', 'title')
      .populate('mentorId', 'name');

    if (!certRequest) return res.status(404).json({ success: false, message: 'Request not found' });
    if (certRequest.mentorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    certRequest.status = status;
    await certRequest.save();

    if (status === 'approved') {
      const cert = await Certificate.create({
        studentId: certRequest.studentId._id,
        courseId: certRequest.courseId._id,
        mentorId: certRequest.mentorId._id,
        issuedAt: new Date(),
      });

      // Auto-assign course completion badge
      const completionBadge = await Badge.findOne({ title: 'Course Completer' });
      if (completionBadge) {
        const existingBadge = await UserBadge.findOne({ userId: certRequest.studentId._id, badgeId: completionBadge._id });
        if (!existingBadge) {
          await UserBadge.create({
            userId: certRequest.studentId._id,
            badgeId: completionBadge._id,
            courseId: certRequest.courseId._id,
          });
        }
      }

      return res.json({ success: true, message: 'Certificate approved and issued', data: cert });
    }

    res.json({ success: true, message: 'Request updated', data: certRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get certificate requests (mentor sees theirs, student sees theirs)
// @route  GET /api/certificates/requests
const getCertificateRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'mentor') filter.mentorId = req.user._id;
    if (req.user.role === 'student') filter.studentId = req.user._id;

    const requests = await CertificateRequest.find(filter)
      .populate('studentId', 'name email avatar')
      .populate('courseId', 'title thumbnail')
      .populate('mentorId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get student's certificates
// @route  GET /api/certificates/mine
const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ studentId: req.user._id })
      .populate('courseId', 'title thumbnail')
      .populate('mentorId', 'name email')
      .sort({ issuedAt: -1 });

    res.json({ success: true, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   View certificate HTML (printable)
// @route  GET /api/certificates/:id/view
const viewCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('studentId', 'name')
      .populate('courseId', 'title')
      .populate('mentorId', 'name');

    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });

    const html = generateCertificateHTML({
      studentName: cert.studentId.name,
      courseName: cert.courseId.title,
      mentorName: cert.mentorId.name,
      issuedAt: cert.issuedAt,
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all certified students (employer view)
// @route  GET /api/certificates/students
const getCertifiedStudents = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate('studentId', 'name email avatar bio skills')
      .populate('courseId', 'title')
      .populate('mentorId', 'name')
      .sort({ issuedAt: -1 });

    res.json({ success: true, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestCertificate,
  respondToCertificateRequest,
  getCertificateRequests,
  getMyCertificates,
  viewCertificate,
  getCertifiedStudents,
};
