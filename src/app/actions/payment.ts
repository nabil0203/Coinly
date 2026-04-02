'use server';

import { cache } from 'react';
import dbConnect from '@/lib/db';
import PaymentMethod from '@/models/PaymentMethod';
import { getCurrentUser } from '@/lib/auth';
import { PaymentMethodSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export const getPaymentMethods = cache(async () => {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return [];

  const methods = await PaymentMethod.find({ user: user.userId }).lean();
  return JSON.parse(JSON.stringify(methods));
});

export async function addPaymentMethod(name: string, balance: number = 0) {
  const parsed = PaymentMethodSchema.safeParse({ name, balance });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const method = await PaymentMethod.create({
    name: parsed.data.name,
    balance: parsed.data.balance,
    user: user.userId
  });

  revalidatePath('/');
  return JSON.parse(JSON.stringify(method));
}



export async function deletePaymentMethod(id: string) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return;

  await PaymentMethod.deleteOne({ _id: id, user: user.userId });
  revalidatePath('/profile');
  revalidatePath('/');
}

export async function renamePaymentMethod(id: string, newName: string) {
  const parsed = PaymentMethodSchema.safeParse({ name: newName });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return;

  const pm = await PaymentMethod.findOne({ _id: id, user: user.userId });
  if (pm) {
    pm.name = parsed.data.name;
    await pm.save();
  }
  revalidatePath('/profile');
  revalidatePath('/');
}
