import { MCQQuestion } from '../mcq/types';

export interface AnalyticsEvent {
  type: 
    | 'mcq_generation_started'
    | 'mcq_generation_completed'
    | 'mcq_generation_failed'
    | 'question_answered'
    | 'file_upload_started'
    | 'file_upload_completed'
    | 'file_upload_failed';
  timestamp: number;
  metadata: Record<string, any>;
  duration?: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.startFlushInterval();
  }

  static getInstance(): AnalyticsService {
    if (!this.instance) {
      this.instance = new AnalyticsService();
    }
    return this.instance;
  }

  trackEvent(
    type: AnalyticsEvent['type'],
    metadata: Record<string, any> = {},
    duration?: number
  ): void {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      metadata,
      duration
    };

    this.events.push(event);

    if (this.events.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  trackMCQGeneration(
    startTime: number,
    questions: MCQQuestion[],
    metadata: Record<string, any>
  ): void {
    const duration = Date.now() - startTime;
    
    this.trackEvent('mcq_generation_completed', {
      ...metadata,
      questionCount: questions.length,
      averageQuestionLength: this.calculateAverageQuestionLength(questions),
      difficultyDistribution: this.calculateDifficultyDistribution(questions)
    }, duration);
  }

  private calculateAverageQuestionLength(questions: MCQQuestion[]): number {
    const totalLength = questions.reduce(
      (sum, q) => sum + q.question.length,
      0
    );
    return Math.round(totalLength / questions.length);
  }

  private calculateDifficultyDistribution(
    questions: MCQQuestion[]
  ): Record<string, number> {
    return questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events: eventsToSend })
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Add events back to the queue
      this.events = [...eventsToSend, ...this.events];
    }
  }

  private startFlushInterval(): void {
    setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }
}

export const analytics = AnalyticsService.getInstance(); 