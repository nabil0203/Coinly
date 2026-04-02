'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { LoginSchema, RegistrationSchema } from '@/lib/validations';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
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
