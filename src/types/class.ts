export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface EnrolledStudent {
  student: User;
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'completed';
}

export interface Class {
  _id: string;
  title: string;
  description: string;
  instructor: User;
  lectures: Lecture[];
  enrolledStudents: EnrolledStudent[];
  isPublic: boolean;
  category: 'Mathematics' | 'Science' | 'History' | 'Literature' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'code' | 'quiz';
  content: string;
  order: number;
  metadata?: {
    [key: string]: string;
  };
}

export interface QuizScore {
  questionId: string;
  score: number;
  attempts: number;
}

export interface StudentProgress {
  student: string;
  completed: boolean;
  lastAccessed: Date;
  timeSpent: number;
  quizScores: QuizScore[];
}

export interface Lecture {
  _id: string;
  title: string;
  class: string | Class;
  order: number;
  description: string;
  content: ContentBlock[];
  duration: number;
  prerequisites: string[];
  status: 'draft' | 'published' | 'archived';
  questions: string[];
  resources: {
    title: string;
    type: 'pdf' | 'link' | 'file';
    url: string;
  }[];
  studentProgress: StudentProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassFilters {
  category?: string;
  level?: string;
  isPublic?: boolean;
  search?: string;
}

export interface LectureOrder {
  lectureId: string;
  order: number;
} 