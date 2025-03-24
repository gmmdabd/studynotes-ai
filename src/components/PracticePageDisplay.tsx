import React from 'react';
import { PracticePage } from '@prisma/client';
import { formatDate } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface PracticePageDisplayProps {
  practicePage: PracticePage;
  onClose?: () => void;
}

export function PracticePageDisplay({ practicePage, onClose }: PracticePageDisplayProps) {
  if (!practicePage) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{practicePage.title}</h2>
            <p className="text-sm text-gray-500">
              Created on {formatDate(new Date(practicePage.createdAt))}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {practicePage.subject && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {practicePage.subject}
                </span>
              )}
              {practicePage.topic && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {practicePage.topic}
                </span>
              )}
              {practicePage.difficulty && (
                <span className={`
                  inline-block text-xs px-2 py-1 rounded
                  ${
                    practicePage.difficulty === 'easy' 
                      ? 'bg-green-100 text-green-800' 
                      : practicePage.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }
                `}>
                  {practicePage.difficulty.charAt(0).toUpperCase() + practicePage.difficulty.slice(1)} Difficulty
                </span>
              )}
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex-grow overflow-auto prose prose-blue max-w-none">
          <ReactMarkdown>{practicePage.content}</ReactMarkdown>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Prompt</h3>
              <p className="mt-1 text-sm text-gray-600">{practicePage.prompt || "No specific prompt used."}</p>
            </div>
            
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 