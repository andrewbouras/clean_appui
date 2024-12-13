import { useState } from 'react';
import { MCQGenerationConfig } from '@/types/mcq.types';

interface MCQConfigurationProps {
  onGenerate: (config: MCQGenerationConfig) => void;
  onCancel: () => void;
  uploadedText: string | null;
  statements?: string[];
}

export function MCQConfiguration({ onGenerate, onCancel, uploadedText, statements = [] }: MCQConfigurationProps) {
  console.log('MCQConfiguration received statements:', statements);
  
  const [config, setConfig] = useState<MCQGenerationConfig>({
    numQuestions: 5,
    questionStyle: 'intermediate',
  });

  const handleGenerate = () => {
    if (!config.numQuestions || !config.questionStyle) {
      alert('Please specify both number of questions and question style');
      return;
    }
    onGenerate(config);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-4xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              min={1}
              max={20}
              placeholder="Enter number of questions"
              value={config.numQuestions || ''}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                numQuestions: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Question Style
            </label>
            <select
              value={config.questionStyle || ''}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                questionStyle: e.target.value as MCQGenerationConfig['questionStyle']
              }))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a style</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="clinical">Clinical</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={!config.numQuestions || !config.questionStyle}
            >
              Generate Questions
            </button>
            <button
              onClick={onCancel}
              className="w-full mt-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Extracted Statements ({statements.length})
            </label>
            <div className="border rounded p-4 bg-gray-50 h-[400px] overflow-y-auto">
              {statements.length > 0 ? (
                <ul className="space-y-2">
                  {statements.map((statement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-gray-500 min-w-[24px]">{index + 1}.</span>
                      <p className="text-sm text-gray-800">{statement}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic text-center">No statements extracted yet</p>
              )}
            </div>
          </div>

          {uploadedText && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Extracted Text Preview
              </label>
              <div className="border rounded p-4 bg-gray-50 max-h-[150px] overflow-y-auto">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {uploadedText.substring(0, 500)}
                  {uploadedText.length > 500 && '...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 