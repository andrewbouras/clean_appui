import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GenerationProgress {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime: number;
  endTime?: number;
  error?: string;
  metadata: {
    contentLength: number;
    numQuestions: number;
    difficulty: string;
    source: 'text' | 'file';
  };
}

interface ProgressState {
  history: GenerationProgress[];
  current: GenerationProgress | null;
  addProgress: (progress: GenerationProgress) => void;
  updateProgress: (requestId: string, updates: Partial<GenerationProgress>) => void;
  clearHistory: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      history: [],
      current: null,
      addProgress: (progress) =>
        set((state) => ({
          history: [progress, ...state.history].slice(0, 50), // Keep last 50
          current: progress
        })),
      updateProgress: (requestId, updates) =>
        set((state) => ({
          history: state.history.map((item) =>
            item.requestId === requestId
              ? { ...item, ...updates }
              : item
          ),
          current:
            state.current?.requestId === requestId
              ? { ...state.current, ...updates }
              : state.current
        })),
      clearHistory: () => set({ history: [], current: null })
    }),
    {
      name: 'mcq-progress-store'
    }
  )
); 