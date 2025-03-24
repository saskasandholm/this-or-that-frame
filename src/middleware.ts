import { NextRequest, NextResponse } from 'next/server';

// Define routes that should be protected
const PROTECTED_ROUTES = [
  '/admin',
  '/admin/(.*)',
  '/submit',
  '/profile'
];

/**
 * Middleware function to protect routes
 * Note: Authentication state is primarily managed by Farcaster Auth Kit client-side
 * This middleware only handles server-side route protection
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const isAuthRedirect = searchParams.has('auth');
  
  // Check for auth cookie (simple check, we rely on client-side auth for most functionality)
  const authCookie = req.cookies.get('farcaster_auth');
  const checkCookie = req.cookies.get('farcaster_auth_check');
  const isAuthenticated = !!authCookie?.value || !!checkCookie?.value;
  
  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => {
    if (route.endsWith('(.*)')) {
      return pathname.startsWith(route.replace('(.*)', ''));
    }
    return pathname === route;
  });
  
  // Redirect to login page if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    console.log('[Middleware] Redirecting unauthenticated user from protected route');
    return NextResponse.redirect(new URL('/?login=required', req.url));
  }
  
  // Special handling for auth redirect to clean up URL
  if (isAuthRedirect) {
    const cleanUrl = new URL(req.url);
    cleanUrl.searchParams.delete('auth');
    cleanUrl.searchParams.delete('t');
    cleanUrl.searchParams.delete('mobile');
    cleanUrl.searchParams.delete('cookies');
    
    return NextResponse.redirect(cleanUrl);
  }
  
  // For all other requests, proceed normally
  return NextResponse.next();
}

// Configuration for which routes middleware should run on
export const config = {
  matcher: [
    // Include all routes except for static files and API routes that don't need auth
    '/((?!_next/static|_next/image|favicon.ico|api/health|api/frame).*)',
  ],
};
