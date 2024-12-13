"use client"

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ConfigPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: GenerationConfig) => void;
  isLoading?: boolean;
}

interface GenerationConfig {
  numQuestions: number;
  difficulty: string;
  topic?: string;
  style?: string;
}

export function CompactConfigPopup({ isOpen, onClose, onGenerate, isLoading }: ConfigPopupProps) {
  const [config, setConfig] = React.useState<GenerationConfig>({
    numQuestions: 5,
    difficulty: 'medium',
    topic: '',
    style: 'standard'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(config);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Question Generation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numQuestions">Number of Questions</Label>
            <Slider
              id="numQuestions"
              min={1}
              max={20}
              step={1}
              value={[config.numQuestions]}
              onValueChange={([value]) => setConfig({ ...config, numQuestions: value })}
            />
            <div className="text-sm text-muted-foreground text-right">{config.numQuestions} questions</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={config.difficulty}
              onValueChange={(value) => setConfig({ ...config, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic (Optional)</Label>
            <Input
              id="topic"
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              placeholder="Enter specific topic"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Questions'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 