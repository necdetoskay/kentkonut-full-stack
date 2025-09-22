import { NextRequest, NextResponse } from 'next/server';
import { verifyBcryptPassword } from '@/lib/crypto';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 [TEST-AUTH] API endpoint called!');
    
    const body = await request.json();
    const { email, password } = body;
    
    console.log('🔥 [TEST-AUTH] Received credentials:', {
      email,
      hasPassword: !!password
    });
    
    if (!email || !password) {
      console.log('❌ [TEST-AUTH] Missing credentials');
      return NextResponse.json({ success: false, error: 'Missing credentials' });
    }
    
    console.log('[TEST-AUTH] Looking up user in database...');
    const user = await db.user.findUnique({
      where: { email }
    });
    
    console.log('[TEST-AUTH] User found:', !!user, 'Has password:', user ? !!user.password : false);
    
    if (!user || !user.password) {
      console.log('[TEST-AUTH] User not found or no password');
      return NextResponse.json({ success: false, error: 'User not found' });
    }
    
    console.log('[TEST-AUTH] Verifying password...');
    const isPasswordValid = await verifyBcryptPassword(password, user.password);
    
    console.log('[TEST-AUTH] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('[TEST-AUTH] Invalid password');
      return NextResponse.json({ success: false, error: 'Invalid password' });
    }
    
    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    };
    
    console.log('[TEST-AUTH] Returning user:', result);
    return NextResponse.json({ success: true, user: result });
    
  } catch (error) {
    console.error('[TEST-AUTH] Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}