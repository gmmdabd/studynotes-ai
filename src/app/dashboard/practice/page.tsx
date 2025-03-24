'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

// Practice paper card component
const PracticeCard = ({ practice, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5"
      onClick={() => onClick(practice)}
    >
      <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">{practice.title}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {practice.subject}
        </span>
        <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
          {practice.difficulty}
        </span>
      </div>
      <p className="text-sm text-gray-600 truncate mb-3">{practice.topic}</p>
      <p className="text-xs text-gray-500">
        Created: {new Date(practice.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default function PracticeDashboard() {
  const router = useRouter();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('User');
  const [dbConnectionError, setDbConnectionError] = useState(false);
  
  const { setCurrentPractice } = useStore();

  // Function to fetch practice papers
  const fetchPractices = async (token) => {
    try {
      const response = await fetch('/api/practice/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 207) {
        // Database connection issue, but we got some demo data
        const data = await response.json();
        setPractices(data.practices || []);
        setDbConnectionError(true);
      } else if (response.ok) {
        const data = await response.json();
        setPractices(data.practices || []);
      } else {
        throw new Error('Failed to fetch practice papers');
      }
    } catch (err) {
      console.error('Error fetching practice papers:', err);
      setError('Failed to load practice papers. Please try again later.');
      setDbConnectionError(true);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication and fetch practice papers
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      // Set user name from auth data
      const userData = session.user.user_metadata;
      setUserName(userData?.name || session.user.email?.split('@')[0] || 'User');
      
      // Fetch practice papers
      await fetchPractices(session.access_token);
    };
    
    checkAuth();
  }, [router]);

  // Handle practice paper click
  const handlePracticeClick = (practice) => {
    setCurrentPractice(practice);
    router.push(`/dashboard/practice/view`);
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
            <Link href="/dashboard/practice" className="text-gray-700 border-b-2 border-blue-500">Practice Papers</Link>
            <Link href="/dashboard/account" className="text-gray-500 hover:text-gray-700">Account</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Practice Papers</h1>
              <p className="mt-2 text-gray-600">
                Your custom practice papers for test preparation.
              </p>
            </div>
            <Link href="/dashboard/practice/create">
              <Button variant="primary">Create New Practice Paper</Button>
            </Link>
          </div>

          {dbConnectionError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                ⚠️ Database connection issue detected. Some practice papers may not be displayed, and new papers won't be saved permanently.
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading practice papers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-lg mx-auto">
                <p className="text-red-700">{error}</p>
                <p className="mt-2 text-red-600">
                  You can still create new practice papers.
                </p>
              </div>
            </div>
          ) : practices.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No practice papers yet</h3>
              <p className="mt-1 text-gray-500">Get started by creating your first practice paper.</p>
              <div className="mt-6">
                <Link href="/dashboard/practice/create">
                  <Button variant="primary">Create Practice Paper</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {practices.map((practice) => (
                <PracticeCard 
                  key={practice.id} 
                  practice={practice} 
                  onClick={handlePracticeClick} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 