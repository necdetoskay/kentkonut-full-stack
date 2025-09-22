
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  id: string;
}

// GET a single record by ID
export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    const record = await prisma.sayfaArkaPlan.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!record) {
      return NextResponse.json({ message: 'Kayıt bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error fetching SayfaArkaPlan record:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT (update) a record by ID
export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { sayfaUrl, resimUrl } = body;

    if (!sayfaUrl || !resimUrl) {
      return NextResponse.json({ message: 'sayfaUrl and resimUrl are required' }, { status: 400 });
    }

    const updatedRecord = await prisma.sayfaArkaPlan.update({
      where: { id: parseInt(id, 10) },
      data: {
        sayfaUrl,
        resimUrl,
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Error updating SayfaArkaPlan record:", error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === 'P2002') {
                        return NextResponse.json({ message: "Bu sayfa URL'i zaten başka bir kayıtta mevcut." }, { status: 409 });
        }
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Güncellenecek kayıt bulunamadı.' }, { status: 404 });
        }
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a record by ID
export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    await prisma.sayfaArkaPlan.delete({
      where: { id: parseInt(id, 10) },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Error deleting SayfaArkaPlan record:", error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
        return NextResponse.json({ message: 'Silinecek kayıt bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
