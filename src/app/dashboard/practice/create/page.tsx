'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

// PracticeForm component
const PracticeForm = ({ onSubmit, isGenerating }) => {
  const [formData, setFormData] = useState({
    subject: 'math',
    topic: '',
    difficulty: 'medium',
    questions: 5,
    prompt: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'questions' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
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
        <label htmlFor="questions" className="block text-sm font-medium text-gray-700">
          Number of Questions
        </label>
        <select
          id="questions"
          name="questions"
          value={formData.questions}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="3">3 Questions</option>
          <option value="5">5 Questions</option>
          <option value="10">10 Questions</option>
          <option value="15">15 Questions</option>
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
          placeholder="Add any specific instructions or requirements for your practice paper..."
        ></textarea>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating...' : 'Generate Practice Paper'}
      </Button>
    </form>
  );
};

// Practice paper display component
const PracticeDisplay = ({ practice }) => {
  if (!practice) return null;

  return (
    <div className="practice-display">
      <h3 className="text-xl font-bold mb-4">{practice.title}</h3>
      <div className="mb-2">
        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
          {practice.subject}
        </span>
        <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
          {practice.difficulty}
        </span>
      </div>
      <div className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: practice.content }} />
    </div>
  );
};

export default function CreatePracticePage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userName, setUserName] = useState('User');
  const [dbConnectionError, setDbConnectionError] = useState(false);
  
  // Get setCurrentPractice and currentPractice from store
  const { currentPractice, setCurrentPractice } = useStore();

  // Check authentication
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Set user name from auth data
      const userData = session.user.user_metadata;
      setUserName(userData?.name || session.user.email?.split('@')[0] || 'User');
      
      // Check database connection (optional)
      try {
        const response = await fetch('/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        
        if (response.status === 207) {
          setDbConnectionError(true);
        }
      } catch (err) {
        console.warn('Database connection check failed:', err);
        setDbConnectionError(true);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (formData) => {
    setError(null);
    setIsGenerating(true);
    
    try {
      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to generate practice papers');
        setIsGenerating(false);
        return;
      }

      // Generate practice paper using AI
      const response = await fetch('/api/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: `${formData.subject} - ${formData.topic} (${formData.difficulty.toUpperCase()})`,
          subject: formData.subject,
          topic: formData.topic,
          difficulty: formData.difficulty,
          questions: formData.questions,
          prompt: formData.prompt || `Generate a ${formData.difficulty} difficulty practice paper on ${formData.topic} with ${formData.questions} questions.`,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setError('You have reached your daily limit for practice paper generation');
        } else if (response.status === 207) {
          // The practice paper was generated but not saved to the database (demo mode)
          const data = await response.json();
          
          if (data.practice) {
            // If the API returned a demo practice paper object, use it directly
            setCurrentPractice(data.practice);
          } else {
            // Create a temporary practice paper object
            setCurrentPractice({
              id: 'temp-' + Date.now(),
              title: `${formData.subject} - ${formData.topic} (${formData.difficulty.toUpperCase()})`,
              subject: formData.subject,
              topic: formData.topic,
              difficulty: formData.difficulty,
              content: data.content || '',
              prompt: formData.prompt || '',
              userId: session.user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          
          setDbConnectionError(true);
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to generate practice paper');
        }
      } else {
        // Success - practice paper was generated and saved
        const data = await response.json();
        setCurrentPractice(data.practice);
      }
    } catch (err) {
      console.error('Error generating practice paper:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setCurrentPractice(null);
    router.push('/dashboard/practice');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">StudyNotes</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">Welcome, {userName}!</span>
            </div>
          </div>
          <div className="flex space-x-8 py-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
            <Link href="/dashboard/notes" className="text-gray-500 hover:text-gray-700">Notes</Link>
            <Link href="/dashboard/practice" className="text-gray-500 hover:text-gray-700">Practice Papers</Link>
            <Link href="/dashboard/account" className="text-gray-500 hover:text-gray-700">Account</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Practice Paper</h1>
            <p className="mt-2 text-gray-600">
              Generate custom practice papers with varying difficulty levels.
            </p>
            {dbConnectionError && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  ⚠️ Database connection issue detected. You can still generate practice papers, but they won't be saved permanently.
                  You can copy the content once generated.
                </p>
              </div>
            )}
          </div>

          {!currentPractice ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <PracticeForm onSubmit={handleSubmit} isGenerating={isGenerating} />
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Generated Practice Paper</h2>
                <Button onClick={handleClose} variant="outline">Close & Return</Button>
              </div>
              
              <PracticeDisplay practice={currentPractice} />
              
              {dbConnectionError && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700 mb-2">
                    ⚠️ This practice paper was generated successfully but couldn't be saved to the database.
                    Please copy the content you need before leaving this page.
                  </p>
                  <Button
                    onClick={() => {
                      // Copy to clipboard
                      navigator.clipboard.writeText(currentPractice.content);
                      alert('Content copied to clipboard!');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Copy Content
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 