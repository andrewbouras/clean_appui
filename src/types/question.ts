export interface Question {
  id: number;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: string;
} 