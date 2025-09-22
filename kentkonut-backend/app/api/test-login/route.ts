import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔐 Test login attempt for:', email);
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email ve şifre gerekli' 
      }, { status: 400 });
    }
    
    const user = await db.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      }, { status: 401 });
    }
    
    if (!user.password) {
      console.log('❌ No password for user:', email);
      return NextResponse.json({ 
        success: false, 
        message: 'Kullanıcı şifresi bulunamadı' 
      }, { status: 401 });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json({ 
        success: false, 
        message: 'Geçersiz şifre' 
      }, { status: 401 });
    }
    
    console.log('✅ Login successful for:', email);
    
    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ Test login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Sunucu hatası' 
    }, { status: 500 });
  }
}
