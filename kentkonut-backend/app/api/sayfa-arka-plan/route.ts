
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all records
export async function GET() {
  try {
    const records = await prisma.sayfaArkaPlan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching SayfaArkaPlan records:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new record
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sayfaUrl, resimUrl } = body;

    if (!sayfaUrl || !resimUrl) {
      return NextResponse.json({ message: 'sayfaUrl and resimUrl are required' }, { status: 400 });
    }

    const newRecord = await prisma.sayfaArkaPlan.create({
      data: {
        sayfaUrl,
        resimUrl,
      },
    });
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating SayfaArkaPlan record:", error);
    
    // Prisma unique constraint violation
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: "Bu sayfa URL'i için zaten bir kayıt mevcut." }, { status: 409 });
    }
    
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
