'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/login');
          return;
        }

        // Get user metadata (this works even if database is inaccessible)
        const userData = session.user.user_metadata;
        setUserName(userData?.name || session.user.email?.split('@')[0] || 'User');
        
        // Try to fetch user data from our database
        try {
          if (retryCount < 3) { // Limit retry attempts
            const response = await fetch('/api/users', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
            });
            
            if (!response.ok && response.status !== 207) {
              console.warn('Could not fetch user data from database:', response.status);
              // Continue showing basic dashboard
            }
          }
        } catch (dbErr) {
          console.error('Error fetching user data:', dbErr);
          // Increment retry count to limit retries
          setRetryCount(prev => prev + 1);
          // Continue showing basic dashboard
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setError('Error loading user data. Please try logging in again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, retryCount]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/auth/login')}>Go to Login</Button>
          </div>
        </div>
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
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
          <div className="flex space-x-8 py-4">
            <Link href="/dashboard" className="text-blue-600 font-medium">Dashboard</Link>
            <Link href="/dashboard/notes" className="text-gray-500 hover:text-gray-700">Notes</Link>
            <Link href="/dashboard/practice" className="text-gray-500 hover:text-gray-700">Practice Papers</Link>
            <Link href="/dashboard/summarize" className="text-gray-500 hover:text-gray-700">Text Summarizer</Link>
            <Link href="/dashboard/account" className="text-gray-500 hover:text-gray-700">Account</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
            <p className="mt-2 text-gray-600">Here's a summary of your learning activity.</p>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-700">Notes</h2>
                <p className="text-3xl font-bold mt-2">-</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-purple-700">Practice Papers</h2>
                <p className="text-3xl font-bold mt-2">-</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-green-700">Today's Usage</h2>
                <p className="text-3xl font-bold mt-2">-</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Content</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-700">Create Study Notes</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Generate detailed study notes on any subject or topic.
                  </p>
                  <Link href="/dashboard/notes/create">
                    <Button variant="primary" size="sm">Create Notes</Button>
                  </Link>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-700">Create Practice Paper</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Generate custom practice papers with varying difficulty.
                  </p>
                  <Link href="/dashboard/practice/create">
                    <Button variant="secondary" size="sm">Create Practice Paper</Button>
                  </Link>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-700">Summarize Text</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Generate concise summaries of any text with AI assistance.
                  </p>
                  <Link href="/dashboard/summarize">
                    <Button variant="outline" size="sm">Summarize Text</Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Status</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-yellow-600 mb-2">
                    ⚠️ There seems to be an issue connecting to the database. Some features may be limited until this is resolved.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    You can still use the authentication features, but note and practice paper creation may be affected.
                  </p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 