import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export default async function proxy(request: NextRequest) {
  const token = request.cookies.get('coinly_token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login' || pathname === '/register';

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
