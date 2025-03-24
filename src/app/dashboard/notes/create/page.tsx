'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { NoteGenerationForm } from '@/components/NoteGenerationForm';
import { NoteDisplay } from '@/components/NoteDisplay';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function CreateNote() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  const [dbConnectionError, setDbConnectionError] = useState(false);
  
  // Get setCurrentNote and currentNote from store
  const { currentNote, setCurrentNote } = useStore();

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

  const handleSubmit = async (formData: any) => {
    setError(null);
    setIsGenerating(true);
    
    try {
      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to generate notes');
        setIsGenerating(false);
        return;
      }

      // Generate note content using AI
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: formData.topic || 'Untitled Note',
          subject: formData.subject,
          topic: formData.topic,
          prompt: formData.prompt || `Generate notes about ${formData.topic}`,
          detail: formData.detail || 'detailed',
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setError('You have reached your daily limit for note generation');
        } else if (response.status === 207) {
          // The note was generated but not saved to the database (demo mode)
          const data = await response.json();
          
          if (data.note) {
            // If the API returned a demo note object, use it directly
            setCurrentNote(data.note);
          } else {
            // Create a temporary note object
            setCurrentNote({
              id: 'temp-' + Date.now(),
              title: formData.title || 'Untitled Note',
              subject: formData.subject || null,
              topic: formData.topic || null,
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
          setError(data.error || 'Failed to generate note');
        }
      } else {
        // Success - note was generated and saved
        const data = await response.json();
        setCurrentNote(data.note);
      }
    } catch (err) {
      console.error('Error generating note:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setCurrentNote(null);
    router.push('/dashboard/notes');
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Notes</h1>
            <p className="mt-2 text-gray-600">
              Generate comprehensive study notes on any topic using AI.
            </p>
            {dbConnectionError && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  ⚠️ Database connection issue detected. You can still generate notes, but they won't be saved permanently.
                  You can copy the content once generated.
                </p>
              </div>
            )}
          </div>

          {!currentNote ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <NoteGenerationForm onSubmit={handleSubmit} isGenerating={isGenerating} />
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Generated Notes</h2>
                <Button onClick={handleClose} variant="outline">Close & Return</Button>
              </div>
              
              <NoteDisplay note={currentNote} />
              
              {dbConnectionError && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700 mb-2">
                    ⚠️ These notes were generated successfully but couldn't be saved to the database.
                    Please copy the content you need before leaving this page.
                  </p>
                  <Button
                    onClick={() => {
                      // Copy to clipboard
                      navigator.clipboard.writeText(currentNote.content);
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