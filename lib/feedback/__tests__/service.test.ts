import { FeedbackService } from '../service';
import { api } from '../../api/client';
import { analytics } from '../../analytics/service';

jest.mock('../../api/client');
jest.mock('../../analytics/service');

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(() => {
    service = FeedbackService.getInstance();
    jest.clearAllMocks();
  });

  it('should submit feedback and track analytics', async () => {
    const mockFeedback = {
      type: 'question_quality' as const,
      rating: 4,
      metadata: {
        questionId: 'test-id',
        generationId: 'gen-id'
      }
    };

    await service.submitFeedback(
      mockFeedback.type,
      mockFeedback.rating,
      mockFeedback.metadata
    );

    expect(analytics.trackEvent).toHaveBeenCalledWith(
      'feedback_submitted',
      expect.objectContaining({
        feedbackType: mockFeedback.type,
        rating: mockFeedback.rating
      })
    );
  });

  it('should batch feedback submissions', async () => {
    const mockFeedback = {
      type: 'question_quality' as const,
      rating: 4,
      metadata: { questionId: 'test' }
    };

    // Submit multiple feedback items
    for (let i = 0; i < 5; i++) {
      await service.submitFeedback(
        mockFeedback.type,
        mockFeedback.rating,
        mockFeedback.metadata
      );
    }

    expect(api.post).toHaveBeenCalledWith(
      '/api/feedback/batch',
      expect.objectContaining({
        feedback: expect.arrayContaining([
          expect.objectContaining({
            type: mockFeedback.type,
            rating: mockFeedback.rating
          })
        ])
      })
    );
  });
}); 