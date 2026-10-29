import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, verifyToken } from '@/lib/jwt';

// Prefixes that need a valid session (the dashboard home, '/', is checked separately)
const PROTECTED_PREFIXES = ['/ledger', '/debts', '/profile'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = pathname === '/' || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (token && (await verifyToken(token))) return NextResponse.next();

  // Missing, invalid or expired token → back to login (clearing a stale cookie)
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  const response = NextResponse.redirect(loginUrl);
  if (token) response.cookies.delete(AUTH_COOKIE);
  return response;
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png).*)'],
};
