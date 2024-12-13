import { mcqService } from '../client';
import { api } from '../../api/client';

jest.mock('../../api/client');

describe('MCQServiceClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle immediate completion', async () => {
    const mockResponse = {
      data: {
        status: 'completed',
        questions: [
          {
            id: '1',
            question: 'Test question?',
            options: [
              { id: 'a', text: 'Option A', isCorrect: true },
              { id: 'b', text: 'Option B', isCorrect: false }
            ],
            explanation: 'Test explanation',
            difficulty: 'medium',
            tags: ['test']
          }
        ]
      }
    };

    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await mcqService.generateQuestions({
      content: 'Test content'
    });

    expect(result.status).toBe('completed');
    expect(result.questions).toHaveLength(1);
  });

  it('should handle polling for results', async () => {
    // Mock initial response
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        status: 'processing',
        requestId: 'test-id'
      }
    });

    // Mock polling responses
    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: { status: 'processing', requestId: 'test-id' }
      })
      .mockResolvedValueOnce({
        data: {
          status: 'completed',
          questions: []
        }
      });

    const result = await mcqService.generateQuestions({
      content: 'Test content'
    });

    expect(api.get).toHaveBeenCalledTimes(2);
    expect(result.status).toBe('completed');
  });
}); 