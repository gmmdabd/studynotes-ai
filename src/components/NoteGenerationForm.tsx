import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

type Subject = 'math' | 'science' | 'history' | 'english' | 'computer-science' | 'other';

interface NoteGenerationFormProps {
  onSubmit: (formData: NoteFormData) => Promise<void>;
  isGenerating: boolean;
}

export interface NoteFormData {
  prompt: string;
  subject: Subject;
  topic: string;
  detail: 'basic' | 'detailed' | 'comprehensive';
}

export function NoteGenerationForm({ onSubmit, isGenerating }: NoteGenerationFormProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    prompt: '',
    subject: 'math',
    topic: '',
    detail: 'detailed',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          placeholder="e.g., Calculus, World War II, Grammar"
          required
        />
      </div>

      <div>
        <label htmlFor="detail" className="block text-sm font-medium text-gray-700">
          Detail Level
        </label>
        <select
          id="detail"
          name="detail"
          value={formData.detail}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="basic">Basic</option>
          <option value="detailed">Detailed</option>
          <option value="comprehensive">Comprehensive</option>
        </select>
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
          placeholder="Add any specific instructions or requirements for your notes..."
        ></textarea>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isGenerating}
        className="w-full"
      >
        Generate Notes
      </Button>
    </form>
  );
} 