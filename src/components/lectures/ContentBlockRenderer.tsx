import { useState } from 'react';
import { ContentBlock } from '@/types/class';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ContentBlockRendererProps {
  block: ContentBlock;
  onComplete?: () => void;
  onQuizSubmit?: (score: number) => void;
  isEnabled: boolean;
}

export default function ContentBlockRenderer({
  block,
  onComplete,
  onQuizSubmit,
  isEnabled,
}: ContentBlockRendererProps) {
  const [completed, setCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const handleComplete = () => {
    if (!completed && isEnabled) {
      setCompleted(true);
      onComplete?.();
    }
  };

  const handleQuizSubmit = () => {
    if (!completed && isEnabled && selectedAnswer) {
      const isCorrect = selectedAnswer === block.metadata?.correctAnswer;
      setCompleted(true);
      onQuizSubmit?.(isCorrect ? 1 : 0);
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{block.content}</ReactMarkdown>
            {!completed && isEnabled && (
              <Button
                className="mt-4"
                onClick={handleComplete}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <img
              src={block.content}
              alt={block.metadata?.alt || 'Lecture image'}
              className="max-w-full rounded-lg"
            />
            {block.metadata?.caption && (
              <p className="text-sm text-gray-500 text-center">
                {block.metadata.caption}
              </p>
            )}
            {!completed && isEnabled && (
              <Button
                className="mt-4"
                onClick={handleComplete}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={block.content}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {!completed && isEnabled && (
              <Button
                className="mt-4"
                onClick={handleComplete}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        );

      case 'code':
        const language = block.metadata?.language || 'javascript';
        return (
          <div className="space-y-4">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              className="rounded-lg"
            >
              {block.content}
            </SyntaxHighlighter>
            {!completed && isEnabled && (
              <Button
                className="mt-4"
                onClick={handleComplete}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        );

      case 'quiz':
        try {
          const quiz = JSON.parse(block.content);
          return (
            <div className="space-y-6">
              <div className="prose dark:prose-invert">
                <h3>{quiz.question}</h3>
              </div>

              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                disabled={completed || !isEnabled}
              >
                {quiz.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center space-x-2 p-4 rounded-lg border',
                      completed && option === quiz.correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : completed && option === selectedAnswer
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-800'
                    )}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-grow cursor-pointer"
                    >
                      {option}
                    </Label>
                    {completed && option === quiz.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </RadioGroup>

              {completed && (
                <div className="prose dark:prose-invert">
                  <h4>Explanation</h4>
                  <p>{quiz.explanation}</p>
                </div>
              )}

              {!completed && isEnabled && (
                <Button
                  onClick={handleQuizSubmit}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              )}
            </div>
          );
        } catch (error) {
          console.error('Error parsing quiz content:', error);
          return <div>Error loading quiz</div>;
        }

      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className={cn(
      'transition-opacity duration-200',
      (!isEnabled && !completed) && 'opacity-50 pointer-events-none'
    )}>
      {renderContent()}
      {completed && (
        <div className="mt-4 flex items-center text-green-500">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Completed</span>
        </div>
      )}
    </div>
  );
} 