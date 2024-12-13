'use client';

import { useState } from 'react';
import type { MCQQuestion } from '@/lib/mcq/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MCQDisplayProps {
  question: MCQQuestion;
  onAnswer: (selectedOptionId: string) => void;
  showExplanation?: boolean;
}

export function MCQDisplay({ 
  question, 
  onAnswer,
  showExplanation = false 
}: MCQDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(selectedOption);
      setShowAnswer(true);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">
        {question.question}
      </h3>

      <RadioGroup
        value={selectedOption || ''}
        onValueChange={setSelectedOption}
        className="space-y-2"
      >
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`p-3 rounded-md border ${
              showAnswer && option.isCorrect ? 'bg-green-50' : ''
            }`}
          >
            <RadioGroupItem
              value={option.id}
              id={option.id}
              disabled={showAnswer}
            />
            <label htmlFor={option.id} className="ml-2">
              {option.text}
            </label>
          </div>
        ))}
      </RadioGroup>

      {!showAnswer && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}

      {showAnswer && showExplanation && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium">Explanation:</h4>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
} 