'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { ProfileSchema, ChangePasswordSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

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

    const parsed = ProfileSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const validatedData = parsed.data;

    if (validatedData.username && validatedData.username !== user.username) {
        const exists = await User.findOne({ username: validatedData.username });
        if (exists) return { error: 'Username already taken' };
        user.username = validatedData.username;
    }

    if (validatedData.email) user.email = validatedData.email;
    if (validatedData.full_name) user.full_name = validatedData.full_name;

    await user.save();
    revalidatePath('/profile');
    revalidatePath('/'); // To update name in sidebar/home
    return { success: true };
  } catch (error: unknown) {
    return { error: (error as Error).message || 'Profile update failed' };
  }
}

export async function changePasswordAction(data: unknown) {
  await dbConnect();
  const authUser = await getCurrentUser();
  if (!authUser) return { error: 'Authentication required' };

  try {
    const user = await User.findById(authUser.userId);
    if (!user) return { error: 'User not found' };

    const parsed = ChangePasswordSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { currentPassword, newPassword } = parsed.data;

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return { error: 'Incorrect current password' };
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return { success: true };
  } catch (error: unknown) {
    return { error: (error as Error).message || 'Failed to change password' };
  }
}
