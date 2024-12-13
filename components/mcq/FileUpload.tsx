'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileProcessor, FileProcessingStatus } from '@/lib/mcq/fileProcessor';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onProcessed: (text: string) => void;
  onError: (error: Error) => void;
}

export function FileUpload({ onProcessed, onError }: FileUploadProps) {
  const [status, setStatus] = useState<FileProcessingStatus>({
    status: 'uploading',
    progress: 0
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const text = await FileProcessor.processFile(file, setStatus);
      onProcessed(text);
    } catch (error) {
      onError(error as Error);
    }
  }, [onProcessed, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-primary' : 'border-gray-300'}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Drop the file here...'
            : 'Drag & drop a file here, or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: PDF, TXT, DOCX (max 10MB)
        </p>
      </div>

      {status.status !== 'uploading' && status.progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{status.status === 'completed' ? 'Processed' : 'Processing'}</span>
            <span>{Math.round(status.progress)}%</span>
          </div>
          <Progress value={status.progress} />
        </div>
      )}

      {status.error && (
        <div className="text-red-500 text-sm">
          {status.error}
        </div>
      )}
    </div>
  );
} 