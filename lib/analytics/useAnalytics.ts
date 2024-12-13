import { useEffect } from 'react';
import { analytics } from './service';

export function useAnalytics(
  eventType: string,
  metadata: Record<string, any> = {}
) {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      analytics.trackEvent(eventType as any, {
        ...metadata,
        duration
      });
    };
  }, [eventType, metadata]);
}

export function useTrackMCQGeneration() {
  return (questions: any[], metadata: Record<string, any>) => {
    analytics.trackMCQGeneration(Date.now(), questions, metadata);
  };
} 