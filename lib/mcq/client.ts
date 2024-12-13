import { api } from '../api/client';
import type { 
  MCQGenerationRequest, 
  MCQGenerationResponse, 
  MCQServiceError 
} from './types';
import { wsService } from '../websocket/service';

class MCQServiceClient {
  private static POLL_INTERVAL = 2000; // 2 seconds
  private static MAX_RETRIES = 30; // 1 minute max wait

  async generateQuestions(
    request: MCQGenerationRequest
  ): Promise<MCQGenerationResponse> {
    try {
      const response = await api.post<{ requestId: string }>(
        '/api/mcq/generate',
        request
      );

      return new Promise((resolve, reject) => {
        const unsubscribe = wsService.subscribeToProgress(
          response.data.requestId,
          (message) => {
            switch (message.type) {
              case 'mcq_complete':
                unsubscribe();
                resolve({
                  status: 'completed',
                  questions: message.payload.questions!
                });
                break;
              case 'mcq_error':
                unsubscribe();
                reject(new Error(message.payload.error));
                break;
            }
          }
        );

        // Timeout after 5 minutes
        setTimeout(() => {
          unsubscribe();
          reject(new Error('MCQ generation timeout'));
        }, 5 * 60 * 1000);
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): MCQServiceError {
    if (error.response?.data?.code) {
      return error.response.data as MCQServiceError;
    }

    return {
      code: 'MCQ_SERVICE_ERROR',
      message: 'An error occurred while generating questions',
      details: error
    };
  }
}

export const mcqService = new MCQServiceClient(); 