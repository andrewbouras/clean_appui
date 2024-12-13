import { MCQQuestion } from './base';

export interface MatchingQuestion extends Omit<MCQQuestion, 'options'> {
  type: 'matching';
  pairs: Array<{
    id: string;
    left: string;
    right: string;
  }>;
  shuffledPairs?: Array<{
    id: string;
    text: string;
    column: 'left' | 'right';
  }>;
}

export interface OrderingQuestion extends Omit<MCQQuestion, 'options'> {
  type: 'ordering';
  items: Array<{
    id: string;
    text: string;
    correctPosition: number;
  }>;
  shuffledItems?: Array<{
    id: string;
    text: string;
  }>;
}

export interface MultiSelectQuestion extends MCQQuestion {
  type: 'multi_select';
  minSelections?: number;
  maxSelections?: number;
}

export type AdvancedQuestion = 
  | MatchingQuestion 
  | OrderingQuestion 
  | MultiSelectQuestion;

export interface AdvancedQuestionValidation {
  isValid: (answer: any) => boolean;
  getScore: (answer: any) => number;
  getFeedback: (answer: any) => string;
}

export const QuestionValidators: Record<
  AdvancedQuestion['type'], 
  AdvancedQuestionValidation
> = {
  matching: {
    isValid: (answer: Record<string, string>) => {
      if (!answer || typeof answer !== 'object') return false;
      
      // Check if all pairs have valid matches
      const values = Object.values(answer);
      const uniqueValues = new Set(values);
      
      // Each right-side answer should be unique
      return values.length === uniqueValues.size;
    },
    getScore: (answer: Record<string, string>, question: MatchingQuestion) => {
      if (!answer) return 0;
      
      const correctPairs = question.pairs.reduce((count, pair) => {
        return answer[pair.id] === pair.right ? count + 1 : count;
      }, 0);
      
      return correctPairs / question.pairs.length;
    },
    getFeedback: (answer: Record<string, string>, question: MatchingQuestion) => {
      const score = QuestionValidators.matching.getScore(answer, question);
      
      if (score === 1) return 'Perfect match! All pairs are correct.';
      if (score >= 0.5) return 'Good effort! Some pairs are correctly matched.';
      return 'Review the matches carefully. Most pairs are incorrect.';
    }
  },
  
  ordering: {
    isValid: (answer: string[]) => {
      if (!Array.isArray(answer)) return false;
      
      // Check if all items are unique
      const uniqueItems = new Set(answer);
      return answer.length === uniqueItems.size;
    },
    getScore: (answer: string[], question: OrderingQuestion) => {
      if (!Array.isArray(answer)) return 0;
      
      const correctPositions = answer.reduce((count, itemId, index) => {
        const item = question.items.find(i => i.id === itemId);
        return item?.correctPosition === index + 1 ? count + 1 : count;
      }, 0);
      
      return correctPositions / question.items.length;
    },
    getFeedback: (answer: string[], question: OrderingQuestion) => {
      const score = QuestionValidators.ordering.getScore(answer, question);
      
      if (score === 1) return 'Perfect order! All items are in the correct position.';
      if (score >= 0.5) return 'Good attempt! Some items are in the correct position.';
      return 'Try again. Most items are not in their correct positions.';
    }
  },
  
  multi_select: {
    isValid: (answer: string[], question: MultiSelectQuestion) => {
      if (!Array.isArray(answer)) return false;
      
      // Check if selection count is within bounds
      if (question.minSelections && answer.length < question.minSelections) {
        return false;
      }
      if (question.maxSelections && answer.length > question.maxSelections) {
        return false;
      }
      
      // Check if all selected options exist in the question
      return answer.every(id => 
        question.options.some(opt => opt.id === id)
      );
    },
    getScore: (answer: string[], question: MultiSelectQuestion) => {
      if (!Array.isArray(answer)) return 0;
      
      const correctOptions = question.options.filter(opt => opt.isCorrect);
      const selectedCorrect = answer.filter(id => 
        correctOptions.some(opt => opt.id === id)
      );
      
      const incorrectSelections = answer.length - selectedCorrect.length;
      const missedCorrect = correctOptions.length - selectedCorrect.length;
      
      // Penalize for both incorrect selections and missed correct answers
      const totalPenalty = incorrectSelections + missedCorrect;
      const maxPossiblePenalty = Math.max(
        question.options.length,
        correctOptions.length * 2
      );
      
      return Math.max(0, 1 - (totalPenalty / maxPossiblePenalty));
    },
    getFeedback: (answer: string[], question: MultiSelectQuestion) => {
      const score = QuestionValidators.multi_select.getScore(answer, question);
      
      if (score === 1) return 'Perfect! You selected all correct options.';
      if (score >= 0.7) return 'Good job! Most of your selections are correct.';
      if (score >= 0.4) return 'Some correct selections, but there\'s room for improvement.';
      return 'Review the question carefully. Most selections are incorrect.';
    }
  }
}; 