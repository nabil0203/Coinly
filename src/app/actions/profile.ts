'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(data: {
  username?: string;
  email?: string;
  full_name?: string;
}) {
  await dbConnect();
  const authUser = await getCurrentUser();
  if (!authUser) return { error: 'Authentication required' };

  try {
    const user = await User.findById(authUser.userId);
    if (!user) return { error: 'User not found' };

    if (data.username && data.username !== user.username) {
        const exists = await User.findOne({ username: data.username });
        if (exists) return { error: 'Username already taken' };
        user.username = data.username;
    }

    if (data.email) user.email = data.email;
    if (data.full_name) user.full_name = data.full_name;

    await user.save();
    revalidatePath('/profile');
    revalidatePath('/'); // To update name in sidebar/home
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Profile update failed' };
  }
}
