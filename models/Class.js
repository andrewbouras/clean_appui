const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' },
});

const ClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lectures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture'
  }],
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active'
    }
  }],
  permissions: [PermissionSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Science', 'History', 'Literature', 'Other']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ClassSchema.index({ title: 'text', description: 'text' });
ClassSchema.index({ instructor: 1 });
ClassSchema.index({ 'enrolledStudents.student': 1 });

// Virtual for getting total enrolled students
ClassSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Method to check if a user is enrolled
ClassSchema.methods.isUserEnrolled = function(userId) {
  return this.enrolledStudents.some(enrollment => 
    enrollment.student.toString() === userId.toString() && 
    enrollment.status === 'active'
  );
};

// Method to enroll a student
ClassSchema.methods.enrollStudent = function(userId) {
  if (!this.isUserEnrolled(userId)) {
    this.enrolledStudents.push({
      student: userId,
      enrollmentDate: new Date(),
      status: 'active'
    });
  }
  return this.save();
};

module.exports = mongoose.model('Class', ClassSchema); 