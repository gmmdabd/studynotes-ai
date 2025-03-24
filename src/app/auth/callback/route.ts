'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    });
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get the updated cookies from the response
    const { data: { session } } = await supabase.auth.getSession();
    
    // Instead of directly setting cookies, we'll return them in the response
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    if (session) {
      // Set the access token and refresh token as cookies in the response
      response.cookies.set('sb-access-token', session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      
      if (session.refresh_token) {
        response.cookies.set('sb-refresh-token', session.refresh_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
      }
    }
    
    return response;
  }
  
  // No code provided, redirect to home page
  return NextResponse.redirect(new URL('/', request.url));
} 