import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

// Set a timeout for database operations
const DB_TIMEOUT_MS = 5000;

// Helper function to attempt database operations with a timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Database operation timed out'));
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((result) => {
      clearTimeout(timeoutId);
      return result;
    }),
    timeoutPromise
  ]);
}

export async function POST(req: NextRequest) {
  try {
    // Get the Bearer token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { title, subject, topic, prompt } = await req.json();

    if (!title || !prompt) {
      return NextResponse.json(
        { error: 'Title and prompt are required' },
        { status: 400 }
      );
    }

    // Flag to track db connection status
    let dbConnected = false;
    let subscription = null;
    
    // Try database connection, but continue even if it fails
    try {
      // Attempt to connect to the database with a shorter timeout
      await withTimeout(
        prisma.$queryRaw`SELECT 1`,
        2000 // Shorter timeout for connection test
      );
      dbConnected = true;
      
      // If connected, try to get user info
      try {
        const user = await withTimeout(
          prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
          }),
          DB_TIMEOUT_MS
        );

        if (user?.subscription) {
          subscription = user.subscription;
        }
      } catch (userError) {
        console.warn('Failed to fetch user data:', userError);
      }
    } catch (dbError) {
      console.warn('Database connection failed:', dbError);
      // Continue in demo mode
    }

    // Generate note content using OpenRouter API
    const generationPrompt = `Generate comprehensive study notes for the subject: ${subject || ''}, 
      topic: ${topic || ''}, based on the following request: ${prompt}.
      Format the content with proper headings, subheadings, bullet points, and explanations.
      Include key concepts, definitions, examples, and applications where appropriate.`;

    console.log('Using OpenRouter API key length:', process.env.OPENROUTER_API_KEY?.length || 'Missing API key');
    
    let noteContent = '';
    
    // Check if we have an API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('Using demo mode - no API key provided');
      // Generate a simple demo note when no API key is available
      noteContent = `# ${title || 'Study Notes'}
## Introduction to ${subject || 'the subject'}: ${topic || 'General Overview'}

This is a placeholder note generated in demo mode since there's no OpenRouter API key configured.

### Key Concepts
- First key concept about ${topic}
- Second important point to understand
- Third fundamental idea

### Detailed Explanation
The ${topic || 'topic'} is an important concept in ${subject || 'this field'}.
Here we would normally have AI-generated comprehensive notes.

### Examples
1. Example one
2. Example two
3. Example three

### Summary
These study notes provide a basic overview of ${topic || 'the topic'}.
For more detailed content, please configure your OpenRouter API key.`;
    } else {
      // Real AI generation
      try {
        const { text: generatedContent } = await generateText({
          model: openrouter("deepseek/deepseek-r1:free"),
          prompt: generationPrompt,
          temperature: 0.7,
          maxTokens: 4000,
        });
        noteContent = generatedContent;
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        // Fallback to demo content if AI generation fails
        noteContent = `# ${title || 'Study Notes'} (AI Generation Failed)

## Introduction to ${subject || 'the subject'}: ${topic || 'General Overview'}

This is a fallback note because AI generation encountered an error.

### Key Points
- The API call to generate content failed
- This is placeholder content instead
- Please check your API configuration

Error details: ${aiError instanceof Error ? aiError.message : 'Unknown error'}

For assistance, please check your OpenRouter API key and settings.`;
      }
    }
    
    // If database is connected, try to save the note
    if (dbConnected) {
      try {
        const note = await withTimeout(
          prisma.note.create({
            data: {
              title,
              subject,
              topic,
              content: noteContent,
              prompt,
              userId,
            }
          }),
          DB_TIMEOUT_MS
        );

        return NextResponse.json(
          { message: 'Note created successfully', note },
          { status: 201 }
        );
      } catch (dbError) {
        console.error('Database error when saving note:', dbError);
        // Fall through to return content without saving
      }
    }
    
    // If we reach here, either database is not connected or save failed
    // Return the content in a demo format
    return NextResponse.json(
      { 
        message: 'Note content generated in demo mode',
        content: noteContent,
        demo: true,
        note: {
          id: 'demo-' + Date.now(),
          title,
          subject,
          topic,
          content: noteContent,
          prompt,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      },
      { status: 207 } // Using 207 Multi-Status to indicate partial success
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the Bearer token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const url = new URL(req.url);
    const noteId = url.searchParams.get('id');

    try {
      if (noteId) {
        // Get specific note
        const note = await withTimeout(
          prisma.note.findUnique({
            where: {
              id: noteId,
              userId, // Make sure note belongs to authenticated user
            }
          }),
          DB_TIMEOUT_MS
        );

        if (!note) {
          return NextResponse.json(
            { error: 'Note not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({ note }, { status: 200 });
      } else {
        // Get all notes for user
        const notes = await withTimeout(
          prisma.note.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
          }),
          DB_TIMEOUT_MS
        );

        return NextResponse.json({ notes }, { status: 200 });
      }
    } catch (dbError) {
      console.error('Database error when fetching notes:', dbError);
      return NextResponse.json(
        { 
          message: 'Unable to fetch notes from database',
          dbError: 'Database connection failed'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 