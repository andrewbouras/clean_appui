import { useState } from 'react';

interface MCQGenerationConfig {
  numQuestions: number;
  questionStyle?: string;
  difficulty?: string;
}

interface UploadResponse {
  taskId: string;
  message: string;
  status: string;
  "Statements of information"?: string[];
  Count?: number;
  Transcript?: string;
}

// Base URL for all API calls
const API_BASE_URL = 'http://localhost:8080';
const API_PREFIX = '/api/v1';

export function useMCQGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details available');
        console.error('❌ Server response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data: UploadResponse = await response.json();
      console.log('📄 Upload response:', data);

      // Store the task information
      setTaskId(data.taskId);
      setUploadStatus(data.status);
      setIsConfiguring(true);

      console.log('✅ Upload complete:', {
        fileName: file.name,
        taskId: data.taskId,
        status: data.status,
        message: data.message
      });

      return data; // Return the response data

    } catch (error) {
      console.error('❌ Upload error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      throw error; // Re-throw the error
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async (config: MCQGenerationConfig) => {
    if (!taskId) {
      setError('No task available for generation');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/upload/generate/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUploadStatus(data.status);
      setIsConfiguring(false);

      return data;
    } catch (error) {
      console.error('❌ Generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    taskId,
    uploadStatus,
    isConfiguring,
    uploadFile,
    generateQuestions
  };
} 