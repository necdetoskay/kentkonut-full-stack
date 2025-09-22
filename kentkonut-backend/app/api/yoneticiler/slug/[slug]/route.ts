import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log('Backend API: Received slug:', slug); // Log the received slug

    if (!slug) {
      console.log('Backend API: Slug is missing.'); // Log if slug is missing
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const executive = await db.executive.findUnique({
      where: { slug: slug },
    });

    console.log('Backend API: Executive found:', executive); // Log the query result

    if (!executive) {
      console.log('Backend API: Executive not found for slug:', slug); // Log if executive not found
      return NextResponse.json({ error: "Executive not found" }, { status: 404 });
    }

    return NextResponse.json(executive);
  } catch (error) {
    console.error("Error fetching executive by slug:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
