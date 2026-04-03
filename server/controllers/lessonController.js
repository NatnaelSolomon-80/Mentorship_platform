const Lesson = require('../models/Lesson');
const Module = require('../models/Module');

// @desc   Get lessons for a module
// @route  GET /api/lessons/module/:moduleId
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
    res.json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create lesson
// @route  POST /api/lessons
const createLesson = async (req, res) => {
  try {
    const { moduleId, title, type, contentUrl, order, duration } = req.body;
    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    const lesson = await Lesson.create({ moduleId, title, type, contentUrl, order, duration });
    module.lessons.push(lesson._id);
    await module.save();

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update lesson
// @route  PUT /api/lessons/:id
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete lesson
// @route  DELETE /api/lessons/:id
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    await Module.findByIdAndUpdate(lesson.moduleId, { $pull: { lessons: lesson._id } });
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLessons, createLesson, updateLesson, deleteLesson };
