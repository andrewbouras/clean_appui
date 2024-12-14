const mongoose = require('mongoose');

const ContentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'code', 'quiz'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  metadata: {
    // For images: alt text, dimensions
    // For videos: duration, source
    // For code: language, theme
    type: Map,
    of: String
  }
});

const LectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: [ContentBlockSchema],
  duration: {
    type: Number, // in minutes
    required: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['pdf', 'link', 'file']
    },
    url: String
  }],
  studentProgress: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completed: {
      type: Boolean,
      default: false
    },
    lastAccessed: Date,
    timeSpent: Number, // in minutes
    quizScores: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      score: Number,
      attempts: Number
    }]
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
LectureSchema.index({ class: 1, order: 1 });
LectureSchema.index({ 'studentProgress.student': 1 });

// Virtual for getting completion rate
LectureSchema.virtual('completionRate').get(function() {
  if (this.studentProgress.length === 0) return 0;
  const completedCount = this.studentProgress.filter(progress => progress.completed).length;
  return (completedCount / this.studentProgress.length) * 100;
});

// Method to update student progress
LectureSchema.methods.updateStudentProgress = function(userId, progressData) {
  const studentProgressIndex = this.studentProgress.findIndex(
    progress => progress.student.toString() === userId.toString()
  );

  if (studentProgressIndex === -1) {
    this.studentProgress.push({
      student: userId,
      ...progressData,
      lastAccessed: new Date()
    });
  } else {
    this.studentProgress[studentProgressIndex] = {
      ...this.studentProgress[studentProgressIndex],
      ...progressData,
      lastAccessed: new Date()
    };
  }

  return this.save();
};

module.exports = mongoose.model('Lecture', LectureSchema); 