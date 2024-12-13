'use client';

import { useState } from 'react';
import { FeedbackService } from '@/lib/feedback/service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';

interface QuestionFeedbackProps {
  questionId: string;
  generationId: string;
  onFeedbackSubmitted?: () => void;
}

export function QuestionFeedback({
  questionId,
  generationId,
  onFeedbackSubmitted
}: QuestionFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await FeedbackService.getInstance().submitFeedback(
        'question_quality',
        rating,
        {
          questionId,
          generationId,
          context: {
            timestamp: Date.now()
          }
        },
        comment
      );

      setIsSubmitted(true);
      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-sm text-gray-500 text-center">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        How would you rate this question?
      </div>

      <StarRating
        value={rating}
        onChange={setRating}
        disabled={isSubmitting}
      />

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Additional comments (optional)"
        disabled={isSubmitting}
        className="h-24"
      />

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </div>
  );
} 