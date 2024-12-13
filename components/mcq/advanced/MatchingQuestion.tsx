'use client';

import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { MatchingQuestion } from '@/lib/mcq/types/advanced';

interface MatchingQuestionProps {
  question: MatchingQuestion;
  onAnswer: (matches: Record<string, string>) => void;
  disabled?: boolean;
}

interface DraggableItemProps {
  id: string;
  text: string;
  type: 'left' | 'right';
}

function DraggableItem({ id, text, type }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: `${type}_item`,
    item: { id, text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`
        p-3 mb-2 rounded-md border cursor-move
        ${isDragging ? 'opacity-50' : ''}
        ${type === 'left' ? 'bg-blue-50' : 'bg-green-50'}
      `}
    >
      {text}
    </div>
  );
}

function DropZone({ onDrop, type }: { 
  onDrop: (item: any) => void;
  type: 'left' | 'right';
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: `${type}_item`,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`
        h-20 border-2 border-dashed rounded-md
        ${isOver ? 'border-blue-500' : 'border-gray-300'}
      `}
    />
  );
}

export function MatchingQuestion({
  question,
  onAnswer,
  disabled
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});

  const handleDrop = useCallback((leftId: string, rightId: string) => {
    if (disabled) return;

    setMatches((prev) => ({
      ...prev,
      [leftId]: rightId
    }));

    if (Object.keys(matches).length + 1 === question.pairs.length) {
      onAnswer(matches);
    }
  }, [matches, question.pairs.length, onAnswer, disabled]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {question.question}
        </h3>

        <div className="grid grid-cols-2 gap-8">
          {/* Left column */}
          <div>
            {question.shuffledPairs
              ?.filter(item => item.column === 'left')
              .map(item => (
                <DraggableItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  type="left"
                />
              ))}
          </div>

          {/* Right column */}
          <div>
            {question.shuffledPairs
              ?.filter(item => item.column === 'right')
              .map(item => (
                <DraggableItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  type="right"
                />
              ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
} 