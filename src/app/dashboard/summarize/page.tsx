'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function Summarize() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [style, setStyle] = useState<'concise' | 'detailed' | 'bullets' | 'academic'>('concise');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopyPrompt, setShowCopyPrompt] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/login');
          return;
        }

        setToken(session.access_token);
        setUserId(session.user.id);
        
        // Try to fetch user subscription status
        try {
          const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          
          if (response.ok || response.status === 207) {
            const userData = await response.json();
            if (userData.user?.subscription?.plan !== 'FREE') {
              setIsPremium(true);
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          // Continue anyway
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text to summarize');
      return;
    }
    
    if (!token || !userId) {
      setError('You must be logged in to use this feature');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');
    setSaved(false);
    setCopied(false);
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          length,
          style,
          userId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }
      
      const data = await response.json();
      setSummary(data.summary);
      setSaved(data.saved);
      
      // If user is not premium, show the copy prompt
      if (!data.isPremium) {
        setShowCopyPrompt(true);
      }
      
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Text Summarizer</h1>
            <p className="text-gray-600">
              Summarize any text quickly and efficiently
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Text to Summarize
              </label>
              <textarea
                id="text"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste the text you want to summarize here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Length
                </label>
                <select
                  id="length"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={length}
                  onChange={(e) => setLength(e.target.value as any)}
                >
                  <option value="short">Short (1-2 paragraphs)</option>
                  <option value="medium">Medium (3-4 paragraphs)</option>
                  <option value="long">Long (5-6 paragraphs)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Style
                </label>
                <select
                  id="style"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                >
                  <option value="concise">Concise (straight to the point)</option>
                  <option value="detailed">Detailed (with examples)</option>
                  <option value="bullets">Bullet Points (key information)</option>
                  <option value="academic">Academic (formal style)</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                {!isPremium && (
                  <p className="text-xs text-gray-500">
                    Free users can generate summaries but need to copy them manually.
                    <Link href="/dashboard/account" className="ml-1 text-blue-600 hover:underline">
                      Upgrade to Premium
                    </Link>
                  </p>
                )}
                {isPremium && (
                  <p className="text-xs text-gray-500">
                    Premium user: Your summaries will be saved automatically.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Summarize Text'}
              </Button>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4h2V9H9z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
            
            <div className="prose max-w-none">
              {summary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            {saved && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  This summary has been saved to your account.
                </p>
              </div>
            )}
            
            {showCopyPrompt && !isPremium && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-700">
                  As a free user, please make sure to copy your summary as it won't be saved.
                  <Link href="/dashboard/account" className="ml-1 font-medium hover:underline">
                    Upgrade to Premium
                  </Link>
                  {' '}to save all your summaries automatically.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 