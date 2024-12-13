import { api } from '../api/client';
import { analytics } from '../analytics/service';

export type FeedbackType = 
  | 'question_quality'
  | 'question_difficulty'
  | 'generation_speed'
  | 'ui_experience';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  rating: number;
  comment?: string;
  metadata: {
    questionId?: string;
    generationId?: string;
    context?: Record<string, any>;
  };
  createdAt: number;
}

export class FeedbackService {
  private static instance: FeedbackService;
  private feedbackQueue: FeedbackItem[] = [];
  private readonly BATCH_SIZE = 5;

  private constructor() {}

  static getInstance(): FeedbackService {
    if (!this.instance) {
      this.instance = new FeedbackService();
    }
    return this.instance;
  }

  async submitFeedback(
    type: FeedbackType,
    rating: number,
    metadata: FeedbackItem['metadata'],
    comment?: string
  ): Promise<void> {
    const feedback: FeedbackItem = {
      id: crypto.randomUUID(),
      type,
      rating,
      comment,
      metadata,
      createdAt: Date.now()
    };

    this.feedbackQueue.push(feedback);

    analytics.trackEvent('feedback_submitted', {
      feedbackType: type,
      rating,
      hasComment: !!comment
    });

    if (this.feedbackQueue.length >= this.BATCH_SIZE) {
      await this.flushFeedbackQueue();
    }
  }

  private async flushFeedbackQueue(): Promise<void> {
    if (this.feedbackQueue.length === 0) return;

    const feedbackToSend = [...this.feedbackQueue];
    this.feedbackQueue = [];

    try {
      await api.post('/api/feedback/batch', {
        feedback: feedbackToSend
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // Return items to queue
      this.feedbackQueue = [...feedbackToSend, ...this.feedbackQueue];
    }
  }
}

export const feedbackService = FeedbackService.getInstance(); 