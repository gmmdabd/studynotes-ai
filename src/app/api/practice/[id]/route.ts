import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Handler for deleting a practice paper by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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

    // First, check if the practice paper exists and belongs to the user
    const practicePaper = await prisma.practicePaper.findUnique({
      where: { id },
    });

    if (!practicePaper) {
      return NextResponse.json({ error: 'Practice paper not found' }, { status: 404 });
    }

    if (practicePaper.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this practice paper' }, { status: 403 });
    }

    // Delete the practice paper
    await prisma.practicePaper.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Practice paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting practice paper:', error);
    return NextResponse.json({ error: 'Failed to delete practice paper' }, { status: 500 });
  }
} 