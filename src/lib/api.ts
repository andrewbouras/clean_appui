import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  // Get token from localStorage or cookie
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Class-related API calls
export const classApi = {
  // Get all classes with optional filters
  getClasses: async (filters = {}) => {
    const response = await api.get('/classes', { params: filters });
    return response.data;
  },

  // Get enrolled classes for current user
  getEnrolledClasses: async () => {
    const response = await api.get('/classes/enrolled');
    return response.data;
  },

  // Get classes where user is instructor
  getTeachingClasses: async () => {
    const response = await api.get('/classes/teaching');
    return response.data;
  },

  // Get single class by ID
  getClass: async (classId: string) => {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  },

  // Create new class
  createClass: async (classData: any) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  // Update class
  updateClass: async (classId: string, classData: any) => {
    const response = await api.put(`/classes/${classId}`, classData);
    return response.data;
  },

  // Delete class
  deleteClass: async (classId: string) => {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  },

  // Enroll in class
  enrollInClass: async (classId: string) => {
    const response = await api.post(`/classes/${classId}/enroll`);
    return response.data;
  },

  // Unenroll from class
  unenrollFromClass: async (classId: string) => {
    const response = await api.post(`/classes/${classId}/unenroll`);
    return response.data;
  },

  // Get enrolled students
  getEnrolledStudents: async (classId: string) => {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  }
};

// Lecture-related API calls
export const lectureApi = {
  // Get all lectures for a class
  getClassLectures: async (classId: string) => {
    const response = await api.get(`/lectures/class/${classId}`);
    return response.data;
  },

  // Get single lecture
  getLecture: async (lectureId: string) => {
    const response = await api.get(`/lectures/${lectureId}`);
    return response.data;
  },

  // Create new lecture
  createLecture: async (classId: string, lectureData: any) => {
    const response = await api.post(`/lectures/class/${classId}`, lectureData);
    return response.data;
  },

  // Update lecture
  updateLecture: async (lectureId: string, lectureData: any) => {
    const response = await api.put(`/lectures/${lectureId}`, lectureData);
    return response.data;
  },

  // Delete lecture
  deleteLecture: async (lectureId: string) => {
    const response = await api.delete(`/lectures/${lectureId}`);
    return response.data;
  },

  // Update lecture progress
  updateProgress: async (lectureId: string, progressData: any) => {
    const response = await api.post(`/lectures/${lectureId}/progress`, progressData);
    return response.data;
  },

  // Get lecture progress
  getProgress: async (lectureId: string) => {
    const response = await api.get(`/lectures/${lectureId}/progress`);
    return response.data;
  },

  // Reorder lectures
  reorderLectures: async (classId: string, lectureOrders: any[]) => {
    const response = await api.post(`/lectures/class/${classId}/reorder`, {
      lectureOrders
    });
    return response.data;
  }
};

export default api; 