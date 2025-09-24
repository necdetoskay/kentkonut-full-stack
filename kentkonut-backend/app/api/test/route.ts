import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 [TEST] Test endpoint called');
  return NextResponse.json({ 
    success: true, 
    message: 'Backend is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  console.log('🧪 [TEST] Test POST endpoint called');
  return NextResponse.json({ 
    success: true, 
    message: 'Backend POST is working',
    timestamp: new Date().toISOString()
  });
}
