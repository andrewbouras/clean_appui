import { renderWithProviders, createTestQuestion } from '../setup/testUtils';
import { fireEvent, waitFor } from '@testing-library/react';
import { MCQGenerationForm } from '@/components/mcq/MCQGenerationForm';
import { MCQDisplay } from '@/components/mcq/MCQDisplay';
import { QuestionFeedback } from '@/components/feedback/QuestionFeedback';
import { mcqService } from '../../client';
import { analytics } from '../../../analytics/service';
import { feedbackService } from '../../../feedback/service';

jest.mock('../../client');
jest.mock('../../../analytics/service');
jest.mock('../../../feedback/service');

describe('MCQ Generation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete MCQ generation flow', async () => {
    const mockQuestions = [
      createTestQuestion('basic'),
      createTestQuestion('matching')
    ];

    // Mock MCQ generation
    (mcqService.generateQuestions as jest.Mock).mockResolvedValue({
      status: 'completed',
      questions: mockQuestions
    });

    // Render generation form
    const { getByText, getByLabelText } = renderWithProviders(
      <MCQGenerationForm
        onQuestionsGenerated={jest.fn()}
        onError={jest.fn()}
      />
    );

    // Fill and submit form
    fireEvent.change(
      getByLabelText('Content'),
      { target: { value: 'Test content' } }
    );
    
    fireEvent.click(getByText('Generate Questions'));

    // Verify analytics tracked
    await waitFor(() => {
      expect(analytics.trackEvent).toHaveBeenCalledWith(
        'mcq_generation_started',
        expect.any(Object)
      );
    });

    // Answer questions
    mockQuestions.forEach((question, index) => {
      const { getByText: getByTextInQuestion } = renderWithProviders(
        <MCQDisplay
          question={question}
          onAnswer={jest.fn()}
          showExplanation
        />
      );

      if (question.type === 'basic') {
        fireEvent.click(getByTextInQuestion('Option A'));
        fireEvent.click(getByTextInQuestion('Submit Answer'));
      }
    });

    // Submit feedback
    const { getByText: getByTextInFeedback } = renderWithProviders(
      <QuestionFeedback
        questionId={mockQuestions[0].id}
        generationId="test-gen"
        onFeedbackSubmitted={jest.fn()}
      />
    );

    fireEvent.click(getByTextInFeedback('Submit Feedback'));

    await waitFor(() => {
      expect(feedbackService.submitFeedback).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock error in MCQ generation
    (mcqService.generateQuestions as jest.Mock).mockRejectedValue(
      new Error('Generation failed')
    );

    const onError = jest.fn();
    const { getByText, getByLabelText } = renderWithProviders(
      <MCQGenerationForm
        onQuestionsGenerated={jest.fn()}
        onError={onError}
      />
    );

    fireEvent.change(
      getByLabelText('Content'),
      { target: { value: 'Test content' } }
    );
    
    fireEvent.click(getByText('Generate Questions'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(analytics.trackEvent).toHaveBeenCalledWith(
        'mcq_generation_failed',
        expect.any(Object)
      );
    });
  });
}); 