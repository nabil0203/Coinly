'use server';

import dbConnect from '@/lib/db';
import Entry from '@/models/Entry';
import PaymentMethod from '@/models/PaymentMethod';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getEntries(month: number, year: number) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return { expenses: {}, cashin: {}, prevBalance: 0 };

  const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-31`;

  const entries = await Entry.find({
    user: user.userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  }).sort({ date: 1, createdAt: 1 }).lean();

  const grouped = {
    expenses: {} as any,
    cashin: {} as any,
  };

  entries.forEach((e: any) => {
    const date = e.date;
    const typeKey = e.type === 'expense' ? 'expenses' : 'cashin';
    if (!grouped[typeKey][date]) {
      grouped[typeKey][date] = [];
    }
    grouped[typeKey][date].push({
      ...e,
      _id: e._id.toString(),
      user: e.user.toString()
    });
  });

  // Calculate previous balance (all entries before start of month)
  const prevEntries = await Entry.find({
    user: user.userId,
    date: { $lt: startOfMonth }
  }).lean();

  let prevBalance = 0;
  prevEntries.forEach((e: any) => {
    if (e.type === 'cashin') prevBalance += e.amount;
    else prevBalance -= e.amount;
  });

  return { ...grouped, prevBalance };
}

export async function addEntry(type: 'expense' | 'cashin', payload: any | any[]) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const payloads = Array.isArray(payload) ? payload : [payload];

  for (const p of payloads) {
    const entry = await Entry.create({
      ...p,
      type,
      user: user.userId
    });

    // Update payment method balance
    const method = await PaymentMethod.findOne({ name: p.payment_method, user: user.userId });
    if (method) {
      if (type === 'cashin') {
        method.balance += p.amount;
      } else {
        method.balance -= p.amount;
      }
      await method.save();
    }
  }

  revalidatePath('/');
  revalidatePath('/ledger');
  return { success: true };
}

export async function updateEntry(type: 'expense' | 'cashin', id: string, payload: any) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const oldEntry = await Entry.findOne({ _id: id, user: user.userId });
  if (!oldEntry) throw new Error('Entry not found');

  // Revert old payment method balance
  const oldMethod = await PaymentMethod.findOne({ name: oldEntry.payment_method, user: user.userId });
  if (oldMethod) {
    if (oldEntry.type === 'cashin') {
      oldMethod.balance -= oldEntry.amount;
    } else {
      oldMethod.balance += oldEntry.amount;
    }
    await oldMethod.save();
  }

  // Update entry
  Object.assign(oldEntry, payload);
  await oldEntry.save();

  // Apply new payment method balance
  const newMethod = await PaymentMethod.findOne({ name: payload.payment_method, user: user.userId });
  if (newMethod) {
    if (type === 'cashin') {
      newMethod.balance += payload.amount;
    } else {
      newMethod.balance -= payload.amount;
    }
    await newMethod.save();
  }

  revalidatePath('/');
  revalidatePath('/ledger');
  return { success: true };
}

export async function deleteEntry(type: 'expense' | 'cashin', id: string) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const entry = await Entry.findOne({ _id: id, user: user.userId });
  if (!entry) throw new Error('Entry not found');

  // Revert payment method balance
  const method = await PaymentMethod.findOne({ name: entry.payment_method, user: user.userId });
  if (method) {
    if (entry.type === 'cashin') {
      method.balance -= entry.amount;
    } else {
      method.balance += entry.amount;
    }
    await method.save();
  }

  await Entry.deleteOne({ _id: id });

  revalidatePath('/');
  revalidatePath('/ledger');
  return { success: true };
}
