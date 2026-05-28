'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { LoginSchema, RegistrationSchema } from '@/lib/validations';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { authRatelimit } from '@/lib/ratelimit';

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
    headersList.get('x-real-ip') ??
    '127.0.0.1'
  );
}

export async function registerAction(formData: FormData) {
  // Rate limiting — max 5 attempts per 60s per IP
  const ip = await getClientIp();
  const { success: allowed } = await authRatelimit.limit(`register:${ip}`);
  if (!allowed) {
    return { error: 'Too many attempts. Please wait a minute and try again.' };
  }

  await dbConnect();

  const formDataObj = {
    fullName: formData.get('fullName'),
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = RegistrationSchema.safeParse(formDataObj);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { fullName, username, email, password } = parsed.data;

  const existingUser = await User.findOne({ 
    $or: [{ username }, { email }] 
  });

  if (existingUser) {
    return { error: 'Username or email already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      full_name: fullName,
      username,
      email,
      password: hashedPassword,
    });

    // Initialize default payment methods for new user
    const defaultMethods = ['Cash', 'Bank', 'Rocket', 'Bkash', 'Nagad'];
    await Promise.all(
      defaultMethods.map(name => 
        PaymentMethod.create({
          name,
          balance: 0,
          user: user._id
        })
      )
    );

    const token = await signToken({ userId: user._id.toString(), username: user.username });
    await setAuthCookie(token);

    return { success: true };
  } catch (error: unknown) {
    return { error: (error as Error).message || 'Registration failed' };
  }
}

export async function loginAction(formData: FormData) {
  // Rate limiting — max 5 attempts per 60s per IP
  const ip = await getClientIp();
  const { success: allowed } = await authRatelimit.limit(`login:${ip}`);
  if (!allowed) {
    return { error: 'Too many attempts. Please wait a minute and try again.' };
  }

  await dbConnect();

  const formDataObj = {
    username: formData.get('username'),
    password: formData.get('password'),
  };

  const parsed = LoginSchema.safeParse(formDataObj);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, password } = parsed.data;

  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Invalid username or password' };
  }

  const token = await signToken({ userId: user._id.toString(), username: user.username });
  await setAuthCookie(token);

  return { success: true };
}

export async function logoutAction() {
  await removeAuthCookie();
  redirect('/login');
}
