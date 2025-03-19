import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get auth cookie
  const authCookie = request.cookies.get('farcaster_auth');

  // Check for protected routes
  if (
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/submit-topic') ||
    (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login'))
  ) {
    // If no auth cookie, redirect to home page with a login param
    if (!authCookie) {
      return NextResponse.redirect(new URL('/?login=required', request.url));
    }
  }

  return NextResponse.next();
}

// Only run middleware on specified paths
export const config = {
  matcher: ['/profile/:path*', '/submit-topic/:path*', '/admin/:path*'],
};
