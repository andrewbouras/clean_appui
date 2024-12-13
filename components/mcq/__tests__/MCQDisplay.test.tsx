import { render, fireEvent, waitFor } from '@testing-library/react';
import { MCQDisplay } from '../MCQDisplay';

describe('MCQDisplay', () => {
  const mockQuestion = {
    id: '1',
    question: 'Test question?',
    options: [
      { id: 'a', text: 'Option A', isCorrect: true },
      { id: 'b', text: 'Option B', isCorrect: false }
    ],
    explanation: 'Test explanation',
    difficulty: 'medium' as const,
    tags: ['test']
  };

  it('should render question and options', () => {
    const { getByText } = render(
      <MCQDisplay
        question={mockQuestion}
        onAnswer={jest.fn()}
      />
    );

    expect(getByText('Test question?')).toBeInTheDocument();
    expect(getByText('Option A')).toBeInTheDocument();
    expect(getByText('Option B')).toBeInTheDocument();
  });

  it('should handle answer submission', async () => {
    const onAnswer = jest.fn();
    const { getByText, getByLabelText } = render(
      <MCQDisplay
        question={mockQuestion}
        onAnswer={onAnswer}
      />
    );

    fireEvent.click(getByLabelText('Option A'));
    fireEvent.click(getByText('Submit Answer'));

    expect(onAnswer).toHaveBeenCalledWith('a');
  });
}); 