'use client';

import { useState } from 'react';
import { mcqService } from '@/lib/mcq/client';
import type { MCQGenerationRequest, MCQQuestion } from '@/lib/mcq/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface MCQGenerationFormProps {
  onQuestionsGenerated: (questions: MCQQuestion[]) => void;
  onError: (error: Error) => void;
}

export function MCQGenerationForm({ 
  onQuestionsGenerated, 
  onError 
}: MCQGenerationFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const request: MCQGenerationRequest = {
        content,
        difficulty,
        numQuestions: 5 // Default value
      };

      const response = await mcqService.generateQuestions(request);
      
      if (response.status === 'completed') {
        onQuestionsGenerated(response.questions);
      } else {
        throw new Error('Failed to generate questions');
      }
    } catch (error) {
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Content
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter the content to generate questions from..."
          required
          className="min-h-[200px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Difficulty
        </label>
        <Select
          value={difficulty}
          onValueChange={(value: 'easy' | 'medium' | 'hard') => 
            setDifficulty(value)
          }
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
      </div>

      <Button 
        type="submit" 
        disabled={loading || !content.trim()}
        className="w-full"
      >
        {loading ? 'Generating Questions...' : 'Generate Questions'}
      </Button>
    </form>
  );
} 