import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { generateText } from '@/lib/openrouter';
import { withTimeout } from '@/lib/utils';

// Schema for summarization request
const summarizeSchema = z.object({
  text: z.string().min(1),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  style: z.enum(['concise', 'detailed', 'bullets', 'academic']).default('concise'),
  userId: z.string()
});

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
    
    // Parse and validate request body
    const body = await req.json();
    const validatedData = summarizeSchema.parse(body);
    const { text, length, style } = validatedData;
    
    // Check if the userId in the request matches the authenticated user
    if (userId !== validatedData.userId) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    // Flag to track db connection status
    let dbConnected = false;
    let isPremium = false;
    let subscription = null;
    
    // Try database connection, but continue even if it fails
    try {
      // Attempt to connect to the database with a shorter timeout
      await withTimeout(
        prisma.$queryRaw`SELECT 1`,
        2000 // Shorter timeout for connection test
      );
      dbConnected = true;
      
      // If connected, try to get user info and check subscription
      try {
        const user = await withTimeout(
          prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
          }),
          5000
        );

        if (user?.subscription) {
          subscription = user.subscription;
          isPremium = user.subscription.planType !== 'FREE';
        }
      } catch (userError) {
        console.warn('Failed to fetch user data:', userError);
      }
    } catch (dbError) {
      console.warn('Database connection failed:', dbError);
      // Continue in demo mode
    }

    // Generate summary using OpenRouter API
    const lengthGuide = {
      short: "very concise, about 1-2 paragraphs",
      medium: "moderately detailed, about 3-4 paragraphs",
      long: "comprehensive, about 5-6 paragraphs"
    };
    
    const styleGuide = {
      concise: "straightforward and to the point",
      detailed: "thorough with examples",
      bullets: "using bullet points for key information",
      academic: "formal and scholarly with proper citations if available"
    };

    const summarizationPrompt = `Summarize the following text in a ${lengthGuide[length]} style that is ${styleGuide[style]}:

${text}`;

    let summary = '';
    let storagePath = '';
    
    // Generate the summary
    try {
      const { text: generatedSummary } = await generateText({
        model: "deepseek/deepseek-r1:free",
        prompt: summarizationPrompt,
        temperature: 0.5,
        maxTokens: 4000,
      });
      summary = generatedSummary;
    } catch (aiError) {
      console.error('AI generation error:', aiError instanceof Error ? aiError.message : 'Unknown error');
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      );
    }

    // If premium user and database is connected, save the summary
    if (isPremium && dbConnected) {
      try {
        // Store the original text and summary in Supabase Storage
        const timestamp = Date.now();
        
        // Store summary - using simpler path structure
        const summaryFilename = `${userId}-summary-${timestamp}.txt`;
        
        const { data: summaryData, error: summaryError } = await supabase.storage
          .from('user-content')
          .upload(summaryFilename, summary);
          
        if (summaryError) {
          console.error('Error storing summary:', summaryError);
        } else {
          storagePath = summaryFilename;
        }
        
        // Save record in database
        const savedSummary = await prisma.textSummary.create({
          data: {
            originalTextLength: text.length,
            summaryLength: summary.length,
            style,
            length,
            userId,
            storagePath
          }
        });
        
        return NextResponse.json({
          message: 'Summary generated and saved',
          summary,
          saved: true,
          id: savedSummary.id
        }, { status: 200 });
        
      } catch (storageError) {
        console.error('Error saving summary:', storageError);
        // Continue and return the summary without saving
      }
    }
    
    // If not premium or storage failed, just return the summary
    return NextResponse.json({
      message: 'Summary generated',
      summary,
      saved: false,
      isPremium
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in summarization:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process summarization request' },
      { status: 500 }
    );
  }
} 