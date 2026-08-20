'use server';

import dbConnect from '@/lib/db';
import Entry from '@/models/Entry';
import PaymentMethod from '@/models/PaymentMethod';
import MandatoryExpense from '@/models/MandatoryExpense';
import { getCurrentUser } from '@/lib/auth';
import { MandatoryExpenseSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { z } from 'zod';

export interface MandatoryExpenseItem {
  _id: string;
  name: string;
  amount: number;
  default_payment_method: string;
  is_active: boolean;
  order: number;
  arrears: number;
  total_due: number;
  paid_amount: number;
  remaining_amount: number;
  is_fully_paid: boolean;
  paid_on: string | null;
  paid_entries: { _id: string; amount: number; payment_method: string; date: string }[];
}

function getLocalDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetch all active mandatory expense items with automatic month-over-month rollover (arrears).
 * Only fetches entries that are actually needed (date-bounded + name-scoped).
 */
export async function getMandatoryExpenses(): Promise<MandatoryExpenseItem[]> {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonthPrefix = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
  const currentMonthStart = `${currentMonthPrefix}-01`;
  const currentMonthEnd = `${currentMonthPrefix}-31`;

  // Fetch only active expense items
  const items = await MandatoryExpense.find({ is_active: true }).sort({ order: 1, createdAt: 1 }).lean();
  if (items.length === 0) return [];

  // Determine earliest start date across all items to bound the entry query
  const itemNames = items.map((i) => i.name.trim().toLowerCase());
  let earliestStart = currentMonthStart;
  for (const item of items) {
    const createdDate = item.createdAt ? new Date(item.createdAt) : now;
    const sy = createdDate.getFullYear();
    const sm = createdDate.getMonth() + 1;
    if (sy < currentYear || (sy === currentYear && sm < currentMonthNum)) {
      const candidate = `${sy}-${String(sm).padStart(2, '0')}-01`;
      if (candidate < earliestStart) earliestStart = candidate;
    }
  }

  // Single scoped query: only expense entries matching mandatory expense names, from earliest start
  const allEntries = await Entry.find({
    type: 'expense',
    date: { $gte: earliestStart },
    description: { $in: itemNames.map((n) => new RegExp(`^${n}$`, 'i')) },
  }).select('date amount description payment_method').lean();

  // Group entries by description (lowercase)
  const entriesByDesc = new Map<string, typeof allEntries>();
  for (const entry of allEntries) {
    const key = entry.description?.trim().toLowerCase() ?? '';
    if (!entriesByDesc.has(key)) entriesByDesc.set(key, []);
    entriesByDesc.get(key)!.push(entry);
  }

  return JSON.parse(JSON.stringify(
    items.map((item) => {
      const key = item.name.trim().toLowerCase();
      const matchedEntries = entriesByDesc.get(key) ?? [];

      const createdDate = item.createdAt ? new Date(item.createdAt) : now;
      let startYear = createdDate.getFullYear();
      let startMonth = createdDate.getMonth() + 1;

      if (startYear > currentYear || (startYear === currentYear && startMonth > currentMonthNum)) {
        startYear = currentYear;
        startMonth = currentMonthNum;
      }

      // Compute arrears from past months
      let pastMonthsCount = 0;
      let totalPastPaid = 0;
      let curY = startYear;
      let curM = startMonth;

      while (curY < currentYear || (curY === currentYear && curM < currentMonthNum)) {
        pastMonthsCount++;
        const monthPrefix = `${curY}-${String(curM).padStart(2, '0')}`;
        totalPastPaid += matchedEntries
          .filter((e) => typeof e.date === 'string' && e.date.startsWith(monthPrefix))
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        curM++;
        if (curM > 12) { curM = 1; curY++; }
      }

      const arrears = Math.max(0, pastMonthsCount * item.amount - totalPastPaid);

      const currentMonthEntries = matchedEntries.filter(
        (e) => typeof e.date === 'string' && e.date >= currentMonthStart && e.date <= currentMonthEnd
      );
      const paidThisMonth = currentMonthEntries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const totalDue = item.amount + arrears;
      const remainingDue = Math.max(0, totalDue - paidThisMonth);
      const isFullyPaid = totalDue > 0 ? paidThisMonth >= totalDue : true;
      const latestEntry = currentMonthEntries.length > 0
        ? currentMonthEntries.reduce((a, b) => (a.date > b.date ? a : b))
        : null;

      return {
        _id: item._id,
        name: item.name,
        amount: item.amount,
        default_payment_method: item.default_payment_method,
        is_active: item.is_active,
        order: item.order,
        arrears,
        total_due: totalDue,
        paid_amount: paidThisMonth,
        remaining_amount: remainingDue,
        is_fully_paid: isFullyPaid,
        paid_on: latestEntry ? latestEntry.date : null,
        paid_entries: currentMonthEntries.map((e) => ({
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
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const created = await MandatoryExpense.create({
    name: data.name,
    amount: data.amount,
    default_payment_method: data.default_payment_method || 'None',
  });

  revalidatePath('/mandatory');
  return JSON.parse(JSON.stringify({
    _id: created._id.toString(),
    name: created.name,
    amount: created.amount,
    default_payment_method: created.default_payment_method,
    is_active: created.is_active,
    order: created.order,
    arrears: 0,
    total_due: created.amount,
    paid_amount: 0,
    remaining_amount: created.amount,
    is_fully_paid: false,
    paid_on: null,
    paid_entries: [],
  } as MandatoryExpenseItem));
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
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

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
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  await MandatoryExpense.findByIdAndUpdate(id, { is_active: false });
  revalidatePath('/mandatory');
  return { success: true };
}

const PaymentSplitSchema = z.object({
  payment_method: z.string().trim().min(1),
  amount: z.number().min(1, 'Split amount must be at least 1'),
});

/**
 * Mark a mandatory expense as paid (full, partial, or arrears payoff).
 * Supports split payments across multiple payment methods.
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
      const method = await PaymentMethod.findOne({ name: split.payment_method }).session(session);
      if (!method) throw new Error(`Payment method "${split.payment_method}" not found`);
      if (method.balance < split.amount) {
        throw new Error(
          `Insufficient balance in ${split.payment_method}. Available: ৳${method.balance}, Requested: ৳${split.amount}`
        );
      }

      await Entry.create(
        [{
          date: payDate,
          description: item.name,
          amount: split.amount,
          type: 'expense',
          payment_method: split.payment_method,
        }],
        { session }
      );

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
