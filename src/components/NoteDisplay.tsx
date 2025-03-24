import React from 'react';
import { Note } from '@prisma/client';
import { formatDate } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface NoteDisplayProps {
  note: Note;
  onClose?: () => void;
}

export function NoteDisplay({ note, onClose }: NoteDisplayProps) {
  if (!note) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{note.title}</h2>
            <p className="text-sm text-gray-500">
              Created on {formatDate(new Date(note.createdAt))}
            </p>
            {note.subject && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2 mr-2">
                {note.subject}
              </span>
            )}
            {note.topic && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">
                {note.topic}
              </span>
            )}
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
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Prompt</h3>
          <p className="mt-1 text-sm text-gray-600">{note.prompt || "No specific prompt used."}</p>
        </div>
      </div>
    </div>
  );
} 