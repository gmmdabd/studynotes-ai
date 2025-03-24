import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  });
} 