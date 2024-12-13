export interface MCQGenerationRequest {
  content: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  style?: string;
  topic?: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  tags: string[];
}

export interface MCQGenerationResponse {
  questions: MCQQuestion[];
  status: 'completed' | 'processing' | 'failed';
  error?: string;
  requestId?: string;
}

export interface MCQServiceError {
  code: string;
  message: string;
  details?: any;
} 