import { SignJWT, jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. The app cannot start without it.');
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const AUTH_COOKIE = 'coinly_token';
export const SESSION_SECONDS = 60 * 60 * 8; // 8 hours — used for both the token and the cookie

export interface AuthUser {
  userId: string;
  username: string;
}

export function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return { userId: payload.userId as string, username: payload.username as string };
  } catch {
    return null;
  }
}
