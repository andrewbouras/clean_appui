const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { isAuthenticated, isInstructor } = require('../middlewares/auth');

// Get all classes (with filtering)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const filters = {};
    
    // Apply filters based on query parameters
    if (req.query.category) filters.category = req.query.category;
    if (req.query.level) filters.level = req.query.level;
    if (req.query.isPublic) filters.isPublic = req.query.isPublic === 'true';
    
    // Handle search
    if (req.query.search) {
      filters.$text = { $search: req.query.search };
    }

    const classes = await Class.find(filters)
      .populate('instructor', 'name email')
      .select('-enrolledStudents.student.password')
      .sort({ createdAt: -1 });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

// Get classes for current user (as student)
router.get('/enrolled', isAuthenticated, async (req, res) => {
  try {
    const classes = await Class.find({
      'enrolledStudents.student': req.user._id,
      'enrolledStudents.status': 'active'
    })
    .populate('instructor', 'name email')
    .select('-enrolledStudents.student.password');

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled classes', error: error.message });
  }
});

// Get classes created by current user (as instructor)
router.get('/teaching', isAuthenticated, isInstructor, async (req, res) => {
  try {
    const classes = await Class.find({ instructor: req.user._id })
      .populate('instructor', 'name email')
      .select('-enrolledStudents.student.password');

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teaching classes', error: error.message });
  }
});

// Get single class by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('lectures', 'title order status')
      .select('-enrolledStudents.student.password');

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class', error: error.message });
  }
});

// Create new class
router.post('/', isAuthenticated, isInstructor, async (req, res) => {
  try {
    const newClass = new Class({
      ...req.body,
      instructor: req.user._id
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: 'Error creating class', error: error.message });
  }
});

// Update class
router.put('/:id', isAuthenticated, isInstructor, async (req, res) => {
  try {
    const classItem = await Class.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    // Prevent updating certain fields
    delete req.body.instructor;
    delete req.body.enrolledStudents;

    Object.assign(classItem, req.body);
    await classItem.save();

    res.json(classItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating class', error: error.message });
  }
});

// Delete class
router.delete('/:id', isAuthenticated, isInstructor, async (req, res) => {
  try {
    const classItem = await Class.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class', error: error.message });
  }
});

// Enroll in a class
router.post('/:id/enroll', isAuthenticated, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classItem.isUserEnrolled(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    await classItem.enrollStudent(req.user._id);
    res.json({ message: 'Successfully enrolled in class' });
  } catch (error) {
    res.status(400).json({ message: 'Error enrolling in class', error: error.message });
  }
});

// Unenroll from a class
router.post('/:id/unenroll', isAuthenticated, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const enrollmentIndex = classItem.enrolledStudents.findIndex(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ message: 'Not enrolled in this class' });
    }

    classItem.enrolledStudents[enrollmentIndex].status = 'inactive';
    await classItem.save();

    res.json({ message: 'Successfully unenrolled from class' });
  } catch (error) {
    res.status(400).json({ message: 'Error unenrolling from class', error: error.message });
  }
});

// Get enrolled students for a class
router.get('/:id/students', isAuthenticated, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('enrolledStudents.student', 'name email')
      .select('enrolledStudents');

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is instructor or enrolled student
    const isInstructor = classItem.instructor.toString() === req.user._id.toString();
    const isEnrolled = classItem.isUserEnrolled(req.user._id);

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Unauthorized to view enrolled students' });
    }

    res.json(classItem.enrolledStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled students', error: error.message });
  }
});

module.exports = router; 