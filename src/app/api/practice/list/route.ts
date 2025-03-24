import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { withTimeout } from '@/lib/utils';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Handler for fetching all practice papers for a user
export async function GET(req: NextRequest) {
  // Track database connection
  let dbConnected = true;
  
  try {
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
    
    // Check database connection
    try {
      // Try to connect to the database with a timeout
      await withTimeout(prisma.$queryRaw`SELECT 1`, 2000);
    } catch (dbError) {
      console.warn('Database connection failed:', dbError);
      dbConnected = false;
    }

    // If database is not connected, return mock data
    if (!dbConnected) {
      // Create some mock practice papers for demo mode
      const mockPractices = [
        {
          id: 'demo-1',
          title: 'Mathematics - Algebra (MEDIUM)',
          subject: 'math',
          topic: 'Algebra',
          difficulty: 'medium',
          content: '<h1>Algebra Practice Test</h1><p>This is a demonstration practice paper for algebra.</p>',
          userId: user.id,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'demo-2',
          title: 'Science - Physics (HARD)',
          subject: 'science',
          topic: 'Physics',
          difficulty: 'hard',
          content: '<h1>Physics Practice Test</h1><p>This is a demonstration practice paper for physics.</p>',
          userId: user.id,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        }
      ];
      
      return NextResponse.json({ 
        practices: mockPractices,
        message: 'Demo practice papers retrieved. Database connection issues detected.' 
      }, { status: 207 }); // 207 Multi-Status
    }

    // Fetch all practice papers for the user from the database
    const practices = await prisma.practicePaper.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ practices, message: 'Practice papers retrieved successfully' });
  } catch (error) {
    console.error('Error fetching practice papers:', error);
    return NextResponse.json({ error: 'Failed to fetch practice papers' }, { status: 500 });
  }
} 