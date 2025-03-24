import { NextRequest, NextResponse } from 'next/server';

// Using 'any' type for context to bypass TypeScript checks
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ fid: string }> }
) {
  const resolvedParams = await params;
  const fid = resolvedParams.fid;
  return NextResponse.json({ id: fid });
}

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ fid: string }> }
) {
  const resolvedParams = await params;
  return NextResponse.json({ message: 'Admin updated', fid: resolvedParams.fid });
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ fid: string }> }
) {
  const resolvedParams = await params;
  return NextResponse.json({ message: 'Admin deleted', fid: resolvedParams.fid });
}
