'use server';

import mongoose, { type ClientSession } from 'mongoose';
import dbConnect from '@/lib/db';
import Entry from '@/models/Entry';
import PaymentMethod from '@/models/PaymentMethod';
import IOUContact from '@/models/IOUContact';
import { getCurrentUser } from '@/lib/auth';
import { EntryPayloadSchema } from '@/lib/validations';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

type EntryType = 'expense' | 'cashin';
export type EntryPayload = z.input<typeof EntryPayloadSchema>;

export async function getEntries(month: number, year: number) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return { expenses: {}, cashin: {}, prevBalance: 0 };

  const monthStr = String(month + 1).padStart(2, '0');
  const startOfMonth = `${year}-${monthStr}-01`;
  const endOfMonth = `${year}-${monthStr}-31`;

  // Single query: entries for the requested month only (no populate needed — IOU is inline)
  const entries = await Entry.find({
    date: { $gte: startOfMonth, $lte: endOfMonth },
  })
    .sort({ date: 1, createdAt: 1 })
    .lean();

  const grouped: { expenses: Record<string, typeof entries>; cashin: Record<string, typeof entries> } = {
    expenses: {},
    cashin: {},
  };

  for (const e of entries) {
    const typeKey = e.type === 'expense' ? 'expenses' : 'cashin';
    if (!grouped[typeKey][e.date]) grouped[typeKey][e.date] = [];
    grouped[typeKey][e.date].push(e);
  }

  // Compute prevBalance = totalCurrentBalance - net activity from startOfMonth onward
  const [methods, aggregationResult] = await Promise.all([
    PaymentMethod.find({}).select('balance').lean(),
    Entry.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          totalCashin:  { $sum: { $cond: [{ $eq: ['$type', 'cashin'] },  '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ]),
  ]);

  const totalCurrentBalance = methods.reduce((acc, m) => acc + (Number(m.balance) || 0), 0);
  const futureNet = aggregationResult.length > 0
    ? aggregationResult[0].totalCashin - aggregationResult[0].totalExpense
    : 0;
  const prevBalance = totalCurrentBalance - futureNet;

  return JSON.parse(JSON.stringify({ ...grouped, prevBalance }));
}

// ── Shared helpers ───────────────────────────────────────────────────────────

/** Runs `fn` in a Mongo transaction: commit on success, abort + rethrow on failure. */
async function inTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

/** Effect of an entry on its payment method balance: cash-in adds, expense subtracts. */
const signedAmount = (type: EntryType, amount: number) => (type === 'cashin' ? amount : -amount);

async function adjustBalance(session: ClientSession, methodName: string, delta: number) {
  const method = await PaymentMethod.findOne({ name: methodName }).session(session);
  if (!method) return;
  method.balance += delta;
  await method.save({ session });
}

interface IouSubDoc {
  contact_id: unknown;
  iou_type: 'debt' | 'receivable';
  iou_action: 'create' | 'repay';
  details?: string;
}

function toIouSubDoc(iou: EntryPayload['iou']): IouSubDoc | null {
  if (!iou) return null;
  return {
    contact_id: iou.contactId,
    iou_type: iou.iouType,
    iou_action: iou.iouAction,
    details: iou.details || '',
  };
}

/**
 * Applies (direction = 1) or reverts (direction = -1) an IOU entry's effect on its contact's
 * running total. A 'create' grows the total, a 'repay' shrinks it.
 * `claimPrimary` sets the contact's primary_type on its first IOU (only when applying).
 */
async function adjustContact(
  session: ClientSession,
  iou: IouSubDoc,
  amount: number,
  direction: 1 | -1,
  claimPrimary = false
) {
  const contact = await IOUContact.findById(iou.contact_id).session(session);
  if (!contact) return;
  const field = iou.iou_type === 'receivable' ? 'total_receivable' : 'total_debt';
  contact[field] += direction * (iou.iou_action === 'create' ? amount : -amount);
  if (claimPrimary && !contact.primary_type) contact.primary_type = iou.iou_type;
  await contact.save({ session });
}

function revalidateLedgerPaths() {
  revalidatePath('/');
  revalidatePath('/ledger');
  revalidatePath('/debts');
}

async function requireUser() {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
}

// ── Actions ──────────────────────────────────────────────────────────────────

export async function addEntry(type: EntryType, payload: EntryPayload | EntryPayload[]) {
  await requireUser();

  const parsed = z.array(EntryPayloadSchema).safeParse(Array.isArray(payload) ? payload : [payload]);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await inTransaction(async (session) => {
    for (const { iou: iouInput, ...fields } of parsed.data) {
      const iou = toIouSubDoc(iouInput);
      await Entry.create([{ ...fields, type, iou }], { session });
      await adjustBalance(session, fields.payment_method, signedAmount(type, fields.amount));
      if (iou) await adjustContact(session, iou, fields.amount, 1, true);
    }
  });

  revalidateLedgerPaths();
  return { success: true };
}

export async function updateEntry(type: EntryType, id: string, payload: EntryPayload) {
  const parsed = EntryPayloadSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await requireUser();

  await inTransaction(async (session) => {
    const entry = await Entry.findById(id).session(session);
    if (!entry) throw new Error('Entry not found');

    // Undo the old entry's effects
    if (entry.iou) await adjustContact(session, entry.iou, entry.amount, -1);
    await adjustBalance(session, entry.payment_method, -signedAmount(entry.type, entry.amount));

    const { iou: iouInput, ...fields } = parsed.data;
    const iou = toIouSubDoc(iouInput);
    Object.assign(entry, fields);
    entry.iou = iou;
    await entry.save({ session });

    // Apply the new entry's effects
    await adjustBalance(session, fields.payment_method, signedAmount(type, fields.amount));
    if (iou) await adjustContact(session, iou, fields.amount, 1, true);
  });

  revalidateLedgerPaths();
  return { success: true };
}

// `type` is kept so existing callers keep working; the stored entry's own type is what is reverted.
export async function deleteEntry(_type: EntryType, id: string) {
  await requireUser();

  await inTransaction(async (session) => {
    const entry = await Entry.findById(id).session(session);
    if (!entry) throw new Error('Entry not found');

    if (entry.iou) await adjustContact(session, entry.iou, entry.amount, -1);
    await adjustBalance(session, entry.payment_method, -signedAmount(entry.type, entry.amount));
    await Entry.deleteOne({ _id: id }).session(session);
  });

  revalidateLedgerPaths();
  return { success: true };
}
