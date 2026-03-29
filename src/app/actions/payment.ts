'use server';

import dbConnect from '@/lib/db';
import PaymentMethod from '@/models/PaymentMethod';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getPaymentMethods() {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return [];

  const methods = await PaymentMethod.find({ user: user.userId }).lean();
  return JSON.parse(JSON.stringify(methods));
}

export async function addPaymentMethod(name: string, balance: number = 0) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const method = await PaymentMethod.create({
    name,
    balance,
    user: user.userId
  });

  revalidatePath('/');
  return JSON.parse(JSON.stringify(method));
}

export async function updatePaymentMethodBalance(name: string, amount: number, isAddition: boolean) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const method = await PaymentMethod.findOne({ name, user: user.userId });
  if (!method) throw new Error('Payment method not found');

  if (isAddition) {
    method.balance += amount;
  } else {
    method.balance -= amount;
  }

  await method.save();
  revalidatePath('/');
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
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return;

  const pm = await PaymentMethod.findOne({ _id: id, user: user.userId });
  if (pm) {
    pm.name = newName;
    await pm.save();
  }
  revalidatePath('/profile');
  revalidatePath('/');
}
