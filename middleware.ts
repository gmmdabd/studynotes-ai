import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
    },
  });
  
  // Refresh the session if it exists
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // User is authenticated
    res.headers.set('x-auth-user-id', session.user.id);
  }
  
  return res;
} 