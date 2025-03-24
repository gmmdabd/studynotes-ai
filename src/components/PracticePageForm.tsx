import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

type Subject = 'math' | 'science' | 'history' | 'english' | 'computer-science' | 'other';
type Difficulty = 'easy' | 'medium' | 'hard';

interface PracticePageFormProps {
  onSubmit: (formData: PracticeFormData) => Promise<void>;
  isGenerating: boolean;
}

export interface PracticeFormData {
  prompt: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
  includeAnswers: boolean;
}

export function PracticePageForm({ onSubmit, isGenerating }: PracticePageFormProps) {
  const [formData, setFormData] = useState<PracticeFormData>({
    prompt: '',
    subject: 'math',
    topic: '',
    difficulty: 'medium',
    questionCount: 10,
    includeAnswers: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="math">Mathematics</option>
          <option value="science">Science</option>
          <option value="history">History</option>
          <option value="english">English</option>
          <option value="computer-science">Computer Science</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
          Topic
        </label>
        <input
          type="text"
          id="topic"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., Algebra, Chemical Reactions, Civil War"
          required
        />
      </div>

      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
          Difficulty Level
        </label>
        <select
          id="difficulty"
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">
          Number of Questions
        </label>
        <input
          type="number"
          id="questionCount"
          name="questionCount"
          min={1}
          max={50}
          value={formData.questionCount}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeAnswers"
          name="includeAnswers"
          checked={formData.includeAnswers}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="includeAnswers" className="ml-2 block text-sm text-gray-700">
          Include answer key
        </label>
      </div>

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Specific Instructions (Optional)
        </label>
        <textarea
          id="prompt"
          name="prompt"
          rows={4}
          value={formData.prompt}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add any specific instructions or requirements for your practice paper..."
        ></textarea>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isGenerating}
        className="w-full"
      >
        Generate Practice Paper
      </Button>
    </form>
  );
} 