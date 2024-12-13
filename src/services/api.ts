import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Remove auth interceptor for now
// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export interface Notebook {
  _id: string;
  title: string;
  chapters: Chapter[];
}

export interface Chapter {
  _id: string;
  title: string;
  content: string;
  questionType: string;
  strategicMode: boolean;
  intro_questions: boolean;
}

export const notebookService = {
  // Get all notebooks (classes) for the user
  getNotebooks: async () => {
    try {
      const response = await axios.get<Notebook[]>(`${API_BASE_URL}/notebooks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notebooks:', error);
      throw error;
    }
  },
  
  // Create a new notebook (class)
  createNotebook: async (title: string) => {
    try {
      const response = await axios.post<Notebook>(`${API_BASE_URL}/notebooks/new`, { title });
      return response.data;
    } catch (error) {
      console.error('Error creating notebook:', error);
      throw error;
    }
  },
  
  // Create a new chapter (lecture)
  createChapter: async (notebookId: string, data: FormData) => {
    try {
      const response = await axios.post<Chapter>(
        `${API_BASE_URL}/notebooks/${notebookId}/chapters/new`, 
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  },
  
  // Get chapters for a notebook
  getChapters: async (notebookId: string) => {
    try {
      const response = await axios.get<Notebook>(`${API_BASE_URL}/notebooks/${notebookId}`);
      return response.data.chapters;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  },
    
  // Delete a notebook
  deleteNotebook: async (notebookId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/notebooks/${notebookId}`);
    } catch (error) {
      console.error('Error deleting notebook:', error);
      throw error;
    }
  },
    
  // Delete a chapter
  deleteChapter: async (notebookId: string, chapterId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/notebooks/${notebookId}/chapters/${chapterId}`);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      throw error;
    }
  },
}; 