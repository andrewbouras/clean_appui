import React, { useState } from 'react';
import { CompactConfigPopup } from "@/components/CompactConfigPopup"
import { Question } from '@/types/question';
import { useMCQGeneration } from '@/hooks/useMCQGeneration';
import { toast } from '@/components/ui/use-toast';

interface QBankDisplayProps {
  onQuestionsGenerated?: (questions: Question[]) => void;
}

export function QBankDisplay({ onQuestionsGenerated }: QBankDisplayProps) {
  const [showConfig, setShowConfig] = React.useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { generateQuestions, loading } = useMCQGeneration();

  const handleGenerate = async (config: any) => {
    try {
      const generatedQuestions = await generateQuestions(config);
      
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        onQuestionsGenerated?.(generatedQuestions);
        
        toast({
          title: "Success",
          description: `Generated ${generatedQuestions.length} questions successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowConfig(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Empty state */}
      {questions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4">No Questions Yet</h2>
          <p className="text-gray-500 text-center mb-8">
            Configure your question generation settings to get started.
          </p>
        </div>
      )}
      
      {/* Existing question display logic */}
      {questions.length > 0 && (
        <div className="flex-1 p-6">
          {/* Question list will go here */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-medium">{question.question}</h3>
                {/* Add more question display logic as needed */}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Configuration popup */}
      <CompactConfigPopup 
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onGenerate={handleGenerate}
        isLoading={loading}
      />
    </div>
  );
} 