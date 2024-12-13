import { api } from '../api/client';

export interface FileProcessingStatus {
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  text?: string;
}

export class FileProcessor {
  private static ALLOWED_TYPES = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  private static MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static validateFile(file: File): string | null {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PDF, TXT, or DOCX files.';
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 10MB.';
    }

    return null;
  }

  static async processFile(
    file: File,
    onProgress: (status: FileProcessingStatus) => void
  ): Promise<string> {
    // Validate file
    const error = this.validateFile(file);
    if (error) {
      throw new Error(error);
    }

    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/mcq/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.loaded / progressEvent.total! * 100;
          onProgress({
            status: 'uploading',
            progress
          });
        }
      });

      // Process file
      const { processingId } = response.data;
      return this.pollProcessingStatus(processingId, onProgress);
    } catch (error) {
      onProgress({
        status: 'error',
        progress: 0,
        error: 'Failed to process file'
      });
      throw error;
    }
  }

  private static async pollProcessingStatus(
    processingId: string,
    onProgress: (status: FileProcessingStatus) => void
  ): Promise<string> {
    let attempts = 0;
    const maxAttempts = 30; // 1 minute max

    while (attempts < maxAttempts) {
      const response = await api.get(`/api/mcq/process-status/${processingId}`);
      const { status, progress, text, error } = response.data;

      onProgress({
        status,
        progress,
        text,
        error
      });

      if (status === 'completed') {
        return text;
      }

      if (status === 'error') {
        throw new Error(error || 'Processing failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Processing timeout');
  }
} 