import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { generateText } from '@/lib/openrouter';
import { withTimeout } from '@/lib/utils';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Schema for practice paper creation request
const practiceCreateSchema = z.object({
  title: z.string(),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.string(),
  questions: z.number().int().min(1).max(15),
  prompt: z.string(),
  userId: z.string()
});

// Function to generate a practice paper
export async function POST(req: NextRequest) {
  // Track database connection
  let dbConnected = true;
  
  try {
    // Parse request body
    const body = await req.json();
    const validatedData = practiceCreateSchema.parse(body);
    const { title, subject, topic, difficulty, questions, prompt, userId } = validatedData;

    // Create Supabase client to verify auth
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get the bearer token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify that the user ID in the request matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Check database connection
    try {
      // Try to connect to the database with a timeout
      await withTimeout(prisma.$queryRaw`SELECT 1`, 2000);
    } catch (dbError) {
      console.warn('Database connection failed:', dbError);
      dbConnected = false;
    }

    // Generate practice paper content using AI
    const promptContent = generatePromptForPractice(subject, topic, difficulty, questions, prompt);
    
    let content = '';
    try {
      // Use OpenRouter for AI text generation with our utility function
      const result = await generateText({
        model: "deepseek/deepseek-r1:free",
        prompt: promptContent,
        temperature: 0.7,
        maxTokens: 2000
      });
      
      content = result.text;
    } catch (aiError) {
      console.error('AI generation error:', aiError instanceof Error ? aiError.message : 'Unknown error');
      
      // Provide a fallback response if AI fails
      content = `
        <h2>${title}</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Difficulty:</strong> ${difficulty}</p>
        
        <div class="alert alert-warning">
          <p>Sorry, we couldn't generate the practice paper at this time. Please try again later.</p>
          <p>You can still create practice questions manually.</p>
        </div>
        
        <h3>Sample Question Format:</h3>
        <div class="question">
          <p><strong>1.</strong> Write your question here?</p>
          <ul>
            <li>A) Option 1</li>
            <li>B) Option 2</li>
            <li>C) Option 3</li>
            <li>D) Option 4</li>
          </ul>
        </div>
      `;
    }

    // If database is not connected, return content only
    if (!dbConnected) {
      return NextResponse.json(
        { 
          content, 
          practice: {
            id: `demo-${Date.now()}`,
            title,
            subject,
            topic,
            difficulty,
            content,
            prompt,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          message: 'Practice paper generated but not saved to database' 
        }, 
        { status: 207 } // 207 Multi-Status
      );
    }

    // Save practice paper to database - using PracticePage model
    const practice = await prisma.practicePage.create({
      data: {
        title,
        subject,
        topic,
        difficulty,
        content,
        prompt,
        userId
      }
    });

    return NextResponse.json({ practice, message: 'Practice paper generated and saved' });
  } catch (error) {
    console.error('Error in practice paper generation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to generate practice paper' }, { status: 500 });
  }
}

// Helper function to generate the prompt for OpenRouter
function generatePromptForPractice(subject: string, topic: string, difficulty: string, questions: number, customPrompt: string): string {
  if (customPrompt && customPrompt.trim().length > 0) {
    return customPrompt;
  }
  
  return `
    Create a ${difficulty} difficulty practice paper for ${subject} focusing on ${topic}.
    
    Guidelines:
    - Include exactly ${questions} questions
    - For math and science, include step-by-step solutions where appropriate
    - For essay subjects, provide clear evaluation criteria
    - Format the content with proper HTML: use <h1>, <h2>, <p>, <ul>, <li>, etc.
    - For multiple-choice questions, format options as A), B), C), D)
    - Include a mix of question types appropriate for the subject
    
    Format the practice paper with a clear title, instructions, and properly numbered questions.
    If relevant, provide an answer key section at the end.
  `;
} 