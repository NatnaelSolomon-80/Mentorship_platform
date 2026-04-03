const Report = require('../models/Report');

// @desc   Create report
// @route  POST /api/reports
const createReport = async (req, res) => {
  try {
    const { courseId, contentId, contentType, message } = req.body;
    const report = await Report.create({
      studentId: req.user._id,
      courseId,
      contentId,
      contentType,
      message,
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all reports (admin)
// @route  GET /api/reports
const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update report status (admin)
// @route  PATCH /api/reports/:id
const updateReport = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReport, getReports, updateReport };
