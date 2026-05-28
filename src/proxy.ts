import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Public routes that never redirect
const PUBLIC_ROUTES = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through immediately
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this is a protected dashboard route
  const isProtected =
    pathname === '/' ||
    pathname.startsWith('/ledger') ||
    pathname.startsWith('/debts') ||
    pathname.startsWith('/profile');

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get('coinly_token')?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token (jose works in the Edge runtime)
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token is invalid or expired → clear cookie and redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('coinly_token');
    return response;
  }
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png).*)'],
};
