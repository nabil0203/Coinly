'use server';

import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Entry from '@/models/Entry';
import PaymentMethod from '@/models/PaymentMethod';
import MandatoryExpense from '@/models/MandatoryExpense';
import { getCurrentUser } from '@/lib/auth';
import { MandatoryExpenseSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface MandatoryExpenseItem {
  _id: string;
  name: string;
  amount: number;
  default_payment_method: string;
  is_active: boolean;
  order: number;
  paid_on: string | null; // Date string (YYYY-MM-DD) if paid this month, else null
  paid_entries: { _id: string; amount: number; payment_method: string; date: string }[];
}

function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-31`,
  };
}

function getLocalDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetch all active mandatory expense items.
 * Derives paid status from the Entry collection for the current month.
 */
export async function getMandatoryExpenses(): Promise<MandatoryExpenseItem[]> {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return [];

  const { start, end } = getCurrentMonthRange();

  const [items, thisMonthEntries] = await Promise.all([
    MandatoryExpense.find({ is_active: true }).sort({ order: 1, createdAt: 1 }).lean(),
    Entry.find({
      user: user.userId,
      type: 'expense',
      date: { $gte: start, $lte: end },
    }).lean(),
  ]);

  // Build a lookup: description -> matching entries this month
  const entryByDescription = new Map<string, typeof thisMonthEntries>();
  for (const entry of thisMonthEntries) {
    const key = entry.description?.trim().toLowerCase() ?? '';
    if (!entryByDescription.has(key)) {
      entryByDescription.set(key, []);
    }
    entryByDescription.get(key)!.push(entry);
  }

  return JSON.parse(JSON.stringify(
    items.map((item) => {
      const key = item.name.trim().toLowerCase();
      const matchingEntries = entryByDescription.get(key) ?? [];
      const earliestEntry = matchingEntries.length > 0
        ? matchingEntries.reduce((a, b) => (a.date < b.date ? a : b))
        : null;

      return {
        _id: item._id,
        name: item.name,
        amount: item.amount,
        default_payment_method: item.default_payment_method,
        is_active: item.is_active,
        order: item.order,
        paid_on: earliestEntry ? earliestEntry.date : null,
        paid_entries: matchingEntries.map((e) => ({
          _id: e._id,
          amount: e.amount,
          payment_method: e.payment_method,
          date: e.date,
        })),
      };
    })
  ));
}

/**
 * Create a new mandatory expense item.
 */
export async function addMandatoryExpense(data: {
  name: string;
  amount: number;
  default_payment_method?: string;
}) {
  const payload = {
    name: data.name,
    amount: data.amount,
    default_payment_method: data.default_payment_method || 'None',
  };

  await dbConnect();
  const created = await MandatoryExpense.create(payload);

  const item: MandatoryExpenseItem = {
    _id: created._id.toString(),
    name: created.name,
    amount: created.amount,
    default_payment_method: created.default_payment_method,
    is_active: created.is_active,
    order: created.order,
    paid_on: null,
    paid_entries: [],
  };

  revalidatePath('/mandatory');
  return JSON.parse(JSON.stringify(item));
}

/**
 * Update an existing mandatory expense item.
 */
export async function updateMandatoryExpense(
  id: string,
  data: { name: string; amount: number; default_payment_method?: string }
) {
  const parsed = MandatoryExpenseSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await dbConnect();
  const item = await MandatoryExpense.findById(id);
  if (!item) throw new Error('Item not found');

  Object.assign(item, parsed.data);
  await item.save();

  revalidatePath('/mandatory');
  return { success: true };
}

/**
 * Soft-delete a mandatory expense item.
 */
export async function deleteMandatoryExpense(id: string) {
  await dbConnect();
  await MandatoryExpense.findByIdAndUpdate(id, { is_active: false });

  revalidatePath('/mandatory');
  return { success: true };
}

const PaymentSplitSchema = z.object({
  payment_method: z.string().trim().min(1),
  amount: z.number().min(1, 'Split amount must be at least 1'),
});

/**
 * Mark a mandatory expense as paid.
 * Supports partial / split payments across multiple payment methods.
 * Creates one Entry per split, deducting from each respective PaymentMethod balance.
 */
export async function payMandatoryExpense(
  id: string,
  payments: { payment_method: string; amount: number }[],
  date?: string
) {
  const payDate = date || getLocalDateStr();

  if (!payments || payments.length === 0) {
    throw new Error('At least one payment is required');
  }

  const parsedPayments = z.array(PaymentSplitSchema).safeParse(payments);
  if (!parsedPayments.success) {
    throw new Error(parsedPayments.error.issues[0].message);
  }

  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const item = await MandatoryExpense.findById(id);
  if (!item) throw new Error('Mandatory expense not found');

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const split of parsedPayments.data) {
      // Check balance
      const method = await PaymentMethod.findOne({
        name: split.payment_method,
        user: user.userId,
      }).session(session);

      if (!method) throw new Error(`Payment method "${split.payment_method}" not found`);
      if (method.balance < split.amount) {
        throw new Error(
          `Insufficient balance in ${split.payment_method}. Available: ৳${method.balance}, Requested: ৳${split.amount}`
        );
      }

      // Create ledger entry
      await Entry.create(
        [{
          date: payDate,
          description: item.name,
          amount: split.amount,
          type: 'expense',
          payment_method: split.payment_method,
          is_iou: false,
          user: user.userId,
        }],
        { session }
      );

      // Deduct from payment method
      method.balance -= split.amount;
      await method.save({ session });
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  revalidatePath('/mandatory');
  revalidatePath('/');
  revalidatePath('/ledger');
  return { success: true };
}
