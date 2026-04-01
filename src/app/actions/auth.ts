'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  await dbConnect();

  const fullName = formData.get('fullName') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!fullName || !username || !email || !password) {
    return { error: 'All fields are required' };
  }

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
  await dbConnect();

  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

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
