import { cookies } from 'next/headers';
import { AUTH_COOKIE, SESSION_SECONDS, signToken, verifyToken, type AuthUser } from '@/lib/jwt';

/** Signs the user in: issues a token and stores it in an httpOnly cookie. */
export async function createSession(user: AuthUser) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, await signToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_SECONDS,
    path: '/',
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}
