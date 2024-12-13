import { AnalyticsService } from '../service';
import { MCQQuestion } from '../../mcq/types';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    service = AnalyticsService.getInstance();
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation();
    jest.useFakeTimers();
  });

  afterEach(() => {
    fetchMock.mockRestore();
    jest.useRealTimers();
  });

  it('should track events', () => {
    const metadata = { test: 'data' };
    service.trackEvent('mcq_generation_started', metadata);

    expect(fetchMock).not.toHaveBeenCalled();

    // Add more events to trigger flush
    for (let i = 0; i < 9; i++) {
      service.trackEvent('mcq_generation_started', metadata);
    }

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/analytics/events',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String)
      })
    );
  });

  it('should calculate metrics correctly', () => {
    const questions: MCQQuestion[] = [
      {
        id: '1',
        question: 'Test question 1?',
        options: [],
        explanation: '',
        difficulty: 'easy',
        tags: []
      },
      {
        id: '2',
        question: 'Test question 2?',
        options: [],
        explanation: '',
        difficulty: 'medium',
        tags: []
      }
    ];

    service.trackMCQGeneration(Date.now() - 1000, questions, {});

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    const event = body.events[0];

    expect(event.metadata.questionCount).toBe(2);
    expect(event.metadata.averageQuestionLength).toBe(16);
    expect(event.metadata.difficultyDistribution).toEqual({
      easy: 1,
      medium: 1
    });
  });
}); 