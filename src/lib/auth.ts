import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. The app cannot start without it.');
}
const JWT_SECRET = process.env.JWT_SECRET;

interface AuthUser {
  userId: string;
  username: string;
}

export async function signToken(payload: AuthUser) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('coinly_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours in seconds
    path: '/',
  });
}

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('coinly_token')?.value;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('coinly_token');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}
