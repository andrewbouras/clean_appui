'use client';

import { useEffect } from 'react';
import { useProgressStore, GenerationProgress } from '@/lib/mcq/progressStore';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface ProgressTrackerProps {
  requestId: string;
}

export function ProgressTracker({ requestId }: ProgressTrackerProps) {
  const { current, history, updateProgress } = useProgressStore();
  
  const progress = current?.requestId === requestId 
    ? current 
    : history.find(p => p.requestId === requestId);

  if (!progress) return null;

  const duration = progress.endTime 
    ? ((progress.endTime - progress.startTime) / 1000).toFixed(1)
    : ((Date.now() - progress.startTime) / 1000).toFixed(1);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Generation Progress</h3>
        <span className="text-sm text-gray-500">
          {duration}s elapsed
        </span>
      </div>

      <Progress value={progress.progress} />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Status:</span>
          <span className="ml-2 capitalize">{progress.status}</span>
        </div>
        <div>
          <span className="text-gray-500">Questions:</span>
          <span className="ml-2">{progress.metadata.numQuestions}</span>
        </div>
        <div>
          <span className="text-gray-500">Difficulty:</span>
          <span className="ml-2 capitalize">{progress.metadata.difficulty}</span>
        </div>
        <div>
          <span className="text-gray-500">Source:</span>
          <span className="ml-2 capitalize">{progress.metadata.source}</span>
        </div>
      </div>

      {progress.error && (
        <div className="text-red-500 text-sm mt-2">
          Error: {progress.error}
        </div>
      )}
    </Card>
  );
} 