import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MCQQuestion } from '../../types/base';
import { AdvancedQuestion } from '../../types/advanced';

export function createTestQuestion(
  type: 'basic' | 'matching' | 'ordering' | 'multi_select'
): MCQQuestion | AdvancedQuestion {
  switch (type) {
    case 'basic':
      return {
        id: 'test-q1',
        type: 'basic',
        question: 'Test question?',
        options: [
          { id: 'a', text: 'Option A', isCorrect: true },
          { id: 'b', text: 'Option B', isCorrect: false }
        ],
        explanation: 'Test explanation',
        difficulty: 'medium',
        tags: ['test']
      };
    case 'matching':
      return {
        id: 'test-q2',
        type: 'matching',
        question: 'Match the following',
        pairs: [
          { id: 'p1', left: 'A', right: '1' },
          { id: 'p2', left: 'B', right: '2' }
        ],
        explanation: 'Test explanation',
        difficulty: 'medium',
        tags: ['test']
      };
    // Add other cases as needed
    default:
      throw new Error(`Unknown question type: ${type}`);
  }
}

export function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options = {}
) {
  return render(ui, {
    wrapper: createTestWrapper(),
    ...options
  });
} 