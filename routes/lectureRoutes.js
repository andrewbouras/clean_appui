const express = require('express');
const router = express.Router();
const Lecture = require('../models/Lecture');
const Class = require('../models/Class');
const { isAuthenticated, isInstructor } = require('../middlewares/auth');

// Get all lectures for a class
router.get('/class/:classId', isAuthenticated, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is instructor or enrolled
    const isInstructor = classItem.instructor.toString() === req.user._id.toString();
    const isEnrolled = classItem.isUserEnrolled(req.user._id);

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Unauthorized to view lectures' });
    }

    const lectures = await Lecture.find({ class: req.params.classId })
      .sort('order')
      .select('-content'); // Don't send content in list view

    res.json(lectures);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lectures', error: error.message });
  }
});

// Get single lecture by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('class', 'title instructor enrolledStudents');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Check if user is instructor or enrolled
    const isInstructor = lecture.class.instructor.toString() === req.user._id.toString();
    const isEnrolled = lecture.class.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString() && 
      enrollment.status === 'active'
    );

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Unauthorized to view lecture' });
    }

    res.json(lecture);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lecture', error: error.message });
  }
});

// Create new lecture
router.post('/class/:classId', isAuthenticated, isInstructor, async (req, res) => {
  try {
    const classItem = await Class.findOne({
      _id: req.params.classId,
      instructor: req.user._id
    });

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    // Get the highest order number
    const highestOrder = await Lecture.findOne({ class: req.params.classId })
      .sort('-order')
      .select('order');

    const newLecture = new Lecture({
      ...req.body,
      class: req.params.classId,
      order: highestOrder ? highestOrder.order + 1 : 1
    });

    await newLecture.save();

    // Add lecture to class
    classItem.lectures.push(newLecture._id);
    await classItem.save();

    res.status(201).json(newLecture);
  } catch (error) {
    res.status(400).json({ message: 'Error creating lecture', error: error.message });
  }
});

// Update lecture
router.put('/:id', isAuthenticated, isInstructor, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('class', 'instructor');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    if (lecture.class.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update lecture' });
    }

    // Prevent updating certain fields
    delete req.body.class;
    delete req.body.studentProgress;

    Object.assign(lecture, req.body);
    await lecture.save();

    res.json(lecture);
  } catch (error) {
    res.status(400).json({ message: 'Error updating lecture', error: error.message });
  }
});

// Delete lecture
router.delete('/:id', isAuthenticated, isInstructor, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('class', 'instructor lectures');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    if (lecture.class.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete lecture' });
    }

    // Remove lecture from class
    const classItem = lecture.class;
    classItem.lectures = classItem.lectures.filter(
      lectureId => lectureId.toString() !== lecture._id.toString()
    );
    await classItem.save();

    // Delete the lecture
    await lecture.remove();

    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lecture', error: error.message });
  }
});

// Update lecture progress
router.post('/:id/progress', isAuthenticated, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('class', 'enrolledStudents');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Check if user is enrolled in the class
    const isEnrolled = lecture.class.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString() && 
      enrollment.status === 'active'
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Must be enrolled to update progress' });
    }

    await lecture.updateStudentProgress(req.user._id, req.body);
    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating progress', error: error.message });
  }
});

// Get lecture progress for current user
router.get('/:id/progress', isAuthenticated, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const progress = lecture.studentProgress.find(
      progress => progress.student.toString() === req.user._id.toString()
    );

    res.json(progress || { completed: false, timeSpent: 0, quizScores: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
});

// Reorder lectures in a class
router.post('/class/:classId/reorder', isAuthenticated, isInstructor, async (req, res) => {
  try {
    const { lectureOrders } = req.body; // Array of { lectureId, order }
    
    const classItem = await Class.findOne({
      _id: req.params.classId,
      instructor: req.user._id
    });

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    // Update each lecture's order
    await Promise.all(
      lectureOrders.map(({ lectureId, order }) =>
        Lecture.findByIdAndUpdate(lectureId, { order })
      )
    );

    res.json({ message: 'Lectures reordered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error reordering lectures', error: error.message });
  }
});

module.exports = router; 