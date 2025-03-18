import { NextRequest, NextResponse } from 'next/server';

// Using 'any' type for context to bypass TypeScript checks
export async function GET(request: NextRequest, context: any) {
  const fid = context.params.fid;
  return NextResponse.json({ id: fid });
}

export async function PATCH(request: NextRequest, context: any) {
  return NextResponse.json({ message: 'Admin updated', fid: context.params.fid });
}

export async function DELETE(request: NextRequest, context: any) {
  return NextResponse.json({ message: 'Admin deleted', fid: context.params.fid });
}
