import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  return NextResponse.json({ id });
}
