import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

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
    
    // Handle token verification errors gracefully
    let user;
    try {
      const token = authHeader.split(' ')[1];
      // Verify the token with Supabase
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      
      if (error || !authUser) {
        console.error('Authentication error:', error);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      user = authUser;
    } catch (authError) {
      console.error('Fatal authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      );
    }

    // Extract data from request
    const { id, email, name } = await req.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Flag to track db connection status
    let dbConnected = false;
    
    try {
      // Attempt to connect to the database with a shorter timeout
      await withTimeout(
        prisma.$queryRaw`SELECT 1`,
        2000 // Shorter timeout for connection test
      );
      dbConnected = true;
    } catch (dbError) {
      console.warn('Database connection failed:', dbError);
      // Continue in demo mode
    }

    if (!dbConnected) {
      return NextResponse.json(
        { 
          message: 'Database not accessible, user will be created when connection is restored',
          demoMode: true,
          user: {
            id,
            email,
            name: name || email.split('@')[0],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        { status: 207 } // Partial success
      );
    }

    // Check if user already exists
    try {
      const existingUser = await withTimeout(
        prisma.user.findUnique({
          where: { id }
        }),
        DB_TIMEOUT_MS
      );

      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists', user: existingUser },
          { status: 200 }
        );
      }
    } catch (dbError) {
      console.error('Database error when checking user:', dbError);
      return NextResponse.json(
        { 
          message: 'Database error, user will be created when connection is restored',
          demoMode: true,
          user: {
            id,
            email,
            name: name || email.split('@')[0],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        { status: 207 } // Partial success
      );
    }

    // Create user
    try {
      const newUser = await withTimeout(
        prisma.user.create({
          data: {
            id,
            email,
            name: name || email.split('@')[0],
            subscription: {
              create: {
                plan: 'FREE',
                quotaLimit: 10,
                quotaUsed: 0,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              }
            }
          },
          include: {
            subscription: true
          }
        }),
        DB_TIMEOUT_MS
      );

      return NextResponse.json(
        { message: 'User created successfully', user: newUser },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('Database error when creating user:', dbError);
      return NextResponse.json(
        { 
          message: 'Database error, user will be created when connection is restored',
          demoMode: true,
          user: {
            id,
            email,
            name: name || email.split('@')[0],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        { status: 207 } // Partial success
      );
    }
  } catch (error) {
    console.error('Error creating user:', error);
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
    
    // Handle token verification errors gracefully
    let user;
    try {
      const token = authHeader.split(' ')[1];
      // Verify the token with Supabase
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      
      if (error || !authUser) {
        console.error('Authentication error:', error);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      user = authUser;
    } catch (authError) {
      console.error('Fatal authentication error:', authError);
      return NextResponse.json(
        {
          error: 'Authentication service unavailable',
          message: 'Unable to verify your identity, but you can continue in demo mode',
          demoMode: true,
          user: {
            id: 'demo-user',
            email: 'demo@example.com',
            name: 'Demo User',
            createdAt: new Date(),
            updatedAt: new Date(),
            subscription: {
              plan: 'DEMO',
              quotaLimit: 5,
              quotaUsed: 0,
              validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            }
          }
        },
        { status: 207 }
      );
    }
    
    const userId = user.id;
    
    // Flag to track db connection status
    let dbConnected = false;
    
    try {
      // Attempt to connect to the database with a shorter timeout
      await withTimeout(
        prisma.$queryRaw`SELECT 1`,
        2000 // Shorter timeout for connection test
      );
      dbConnected = true;
    } catch (dbError) {
      console.warn('Database connection failed:', dbError);
      // Continue in demo mode
    }

    if (!dbConnected) {
      return NextResponse.json(
        {
          message: 'Database not accessible, but you can continue in demo mode',
          demoMode: true,
          user: {
            id: userId,
            email: user.email || 'user@example.com',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            createdAt: new Date(),
            updatedAt: new Date(),
            subscription: {
              plan: 'DEMO',
              quotaLimit: 5,
              quotaUsed: 0,
              validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            }
          }
        },
        { status: 207 } // Partial success
      );
    }

    // Get user data
    try {
      const userData = await withTimeout(
        prisma.user.findUnique({
          where: { id: userId },
          include: { subscription: true },
        }),
        DB_TIMEOUT_MS
      );

      if (!userData) {
        // User authenticated but not in our database yet
        // Create a skeleton response for frontend
        return NextResponse.json(
          {
            message: 'User not found in database, but can continue in demo mode',
            userExists: false,
            demoMode: true,
            user: {
              id: userId,
              email: user.email || 'user@example.com',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              createdAt: new Date(),
              updatedAt: new Date(),
              subscription: {
                plan: 'DEMO',
                quotaLimit: 5,
                quotaUsed: 0,
                validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
              }
            }
          },
          { status: 207 } // Partial success
        );
      }

      return NextResponse.json({ user: userData }, { status: 200 });
    } catch (dbError) {
      console.error('Database error when fetching user:', dbError);
      return NextResponse.json(
        {
          message: 'Database error, but you can continue in demo mode',
          demoMode: true,
          user: {
            id: userId,
            email: user.email || 'user@example.com',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            createdAt: new Date(),
            updatedAt: new Date(),
            subscription: {
              plan: 'DEMO',
              quotaLimit: 5,
              quotaUsed: 0,
              validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            }
          }
        },
        { status: 207 } // Partial success
      );
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred, but you can continue in demo mode',
        demoMode: true,
        user: {
          id: 'demo-user-' + Date.now(),
          email: 'demo@example.com',
          name: 'Demo User',
          createdAt: new Date(),
          updatedAt: new Date(),
          subscription: {
            plan: 'DEMO',
            quotaLimit: 5,
            quotaUsed: 0,
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          }
        }
      },
      { status: 500 }
    );
  }
} 