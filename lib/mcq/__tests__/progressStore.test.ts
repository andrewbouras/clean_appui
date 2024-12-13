import { renderHook, act } from '@testing-library/react';
import { useProgressStore } from '../progressStore';

describe('Progress Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProgressStore());
    act(() => {
      result.current.clearHistory();
    });
  });

  it('should add new progress', () => {
    const { result } = renderHook(() => useProgressStore());
    
    const progress = {
      requestId: 'test-1',
      status: 'pending' as const,
      progress: 0,
      startTime: Date.now(),
      metadata: {
        contentLength: 1000,
        numQuestions: 5,
        difficulty: 'medium',
        source: 'text' as const
      }
    };

    act(() => {
      result.current.addProgress(progress);
    });

    expect(result.current.current).toEqual(progress);
    expect(result.current.history).toContain(progress);
  });

  it('should update existing progress', () => {
    const { result } = renderHook(() => useProgressStore());
    
    const progress = {
      requestId: 'test-1',
      status: 'pending' as const,
      progress: 0,
      startTime: Date.now(),
      metadata: {
        contentLength: 1000,
        numQuestions: 5,
        difficulty: 'medium',
        source: 'text' as const
      }
    };

    act(() => {
      result.current.addProgress(progress);
      result.current.updateProgress('test-1', {
        status: 'completed',
        progress: 100,
        endTime: Date.now()
      });
    });

    expect(result.current.current?.status).toBe('completed');
    expect(result.current.current?.progress).toBe(100);
  });
}); 