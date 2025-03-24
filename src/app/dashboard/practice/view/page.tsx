'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

const PracticeView = () => {
  const router = useRouter();
  const { currentPractice } = useStore();
  const [userName, setUserName] = React.useState('User');

  // Check if we have a practice paper to display
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      // Set user name from auth data
      const userData = session.user.user_metadata;
      setUserName(userData?.name || session.user.email?.split('@')[0] || 'User');
    };

    checkAuth();

    // If no current practice is selected, redirect to the practice list
    if (!currentPractice) {
      router.push('/dashboard/practice');
    }
  }, [currentPractice, router]);

  if (!currentPractice) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>
    );
  }

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
            <Link href="/dashboard/practice" className="text-gray-700 border-b-2 border-blue-500">Practice Papers</Link>
            <Link href="/dashboard/account" className="text-gray-500 hover:text-gray-700">Account</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Practice Paper</h1>
            <div className="flex space-x-4">
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard/practice')}
              >
                Back to Practice Papers
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Copy the content to clipboard
                  navigator.clipboard.writeText(currentPractice.content);
                  alert('Content copied to clipboard!');
                }}
              >
                Copy Content
              </Button>
              {!currentPractice.id.toString().startsWith('demo-') && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    const confirmation = confirm('Are you sure you want to delete this practice paper?');
                    if (confirmation) {
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        
                        if (session) {
                          const response = await fetch(`/api/practice/${currentPractice.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${session.access_token}`,
                            },
                          });
                          
                          if (response.ok) {
                            router.push('/dashboard/practice');
                          } else {
                            alert('Failed to delete practice paper');
                          }
                        }
                      } catch (error) {
                        console.error('Error deleting practice paper:', error);
                        alert('An error occurred while deleting the practice paper');
                      }
                    }
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{currentPractice.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {currentPractice.subject}
                </span>
                <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  {currentPractice.difficulty}
                </span>
                <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                  Created: {new Date(currentPractice.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentPractice.content }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PracticeView; 