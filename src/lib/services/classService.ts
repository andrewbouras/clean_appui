import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Class {
  _id: string;
  title: string;
  description?: string;
  lectures: Lecture[];
  lectureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lecture {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'processing' | 'completed' | 'error';
  questionCount: number;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationConfig {
  numQuestions: number;
  questionStyle: string;
  boldingOptions: boolean;
  introQuestions: boolean;
}

const classService = {
  // Class (Notebook) operations
  getAllClasses: async (): Promise<Class[]> => {
    const response = await axios.get(`${API_BASE_URL}/notebooks`);
    return response.data;
  },

  getClass: async (classId: string): Promise<Class> => {
    const response = await axios.get(`${API_BASE_URL}/notebooks/${classId}`);
    return response.data;
  },

  createClass: async (title: string, description?: string): Promise<Class> => {
    const response = await axios.post(`${API_BASE_URL}/notebooks/new`, {
      title,
      description
    });
    return response.data;
  },

  updateClass: async (classId: string, title: string, description?: string): Promise<Class> => {
    const response = await axios.put(`${API_BASE_URL}/notebooks/${classId}`, {
      title,
      description
    });
    return response.data;
  },

  deleteClass: async (classId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/notebooks/${classId}`);
  },

  // Lecture (Chapter) operations
  createLecture: async (
    classId: string,
    data: {
      title: string;
      content: string;
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
      generationConfig: GenerationConfig;
    }
  ): Promise<Lecture> => {
    const response = await axios.post(
      `${API_BASE_URL}/notebooks/${classId}/chapters/new`,
      {
        title: data.title,
        content: data.content,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileType: data.fileType,
        questionStyle: data.generationConfig.questionStyle,
        numQuestions: data.generationConfig.numQuestions,
        boldingOptions: data.generationConfig.boldingOptions,
        introQuestions: data.generationConfig.introQuestions
      }
    );
    return response.data;
  },

  getLecture: async (classId: string, lectureId: string): Promise<Lecture> => {
    const response = await axios.get(
      `${API_BASE_URL}/notebooks/${classId}/chapters/${lectureId}`
    );
    return response.data;
  },

  generateMCQs: async (classId: string, lectureId: string): Promise<any> => {
    const response = await axios.post(
      `${API_BASE_URL}/notebooks/${classId}/chapters/${lectureId}/generate-mcq`
    );
    return response.data;
  }
};

export default classService; 