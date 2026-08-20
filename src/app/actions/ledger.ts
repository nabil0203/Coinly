'use server';

import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Entry from '@/models/Entry';
import PaymentMethod from '@/models/PaymentMethod';
import IOUContact from '@/models/IOUContact';
import { getCurrentUser } from '@/lib/auth';
import { EntryPayloadSchema } from '@/lib/validations';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

interface IOUData {
  contactId: string;
  iouType: string;
  iouAction: string;
  details?: string;
}

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

export interface EntryPayload {
  amount: number;
  payment_method: string;
  iou?: IOUData;
  date?: string;
  description?: string;
  [key: string]: unknown;
}

export async function addEntry(type: 'expense' | 'cashin', payload: EntryPayload | EntryPayload[]) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const payloadsArray = Array.isArray(payload) ? payload : [payload];
  const parsed = z.array(EntryPayloadSchema).safeParse(payloadsArray);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const p of parsed.data) {
      // Build the IOU sub-document inline if present
      const iouSubDoc = p.iou
        ? {
            contact_id: p.iou.contactId,
            iou_type: p.iou.iouType,
            iou_action: p.iou.iouAction,
            details: p.iou.details || '',
          }
        : null;

      await Entry.create(
        [{ ...p, type, iou: iouSubDoc }],
        { session }
      );

      // Update payment method balance
      const method = await PaymentMethod.findOne({ name: p.payment_method }).session(session);
      if (method) {
        method.balance += type === 'cashin' ? p.amount : -p.amount;
        await method.save({ session });
      }

      // Update IOU contact totals
      if (p.iou) {
        const contact = await IOUContact.findById(p.iou.contactId).session(session);
        if (contact) {
          if (p.iou.iouType === 'receivable') {
            contact.total_receivable += p.iou.iouAction === 'create' ? p.amount : -p.amount;
          } else if (p.iou.iouType === 'debt') {
            contact.total_debt += p.iou.iouAction === 'create' ? p.amount : -p.amount;
          }
          if (!contact.primary_type) contact.primary_type = p.iou.iouType;
          await contact.save({ session });
        }
      }
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  revalidatePath('/');
  revalidatePath('/ledger');
  revalidatePath('/debts');
  return { success: true };
}

export async function updateEntry(type: 'expense' | 'cashin', id: string, payload: EntryPayload) {
  const parsed = EntryPayloadSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const oldEntry = await Entry.findById(id).session(session);
    if (!oldEntry) throw new Error('Entry not found');

    // Revert old IOU contact totals
    if (oldEntry.iou) {
      const oldContact = await IOUContact.findById(oldEntry.iou.contact_id).session(session);
      if (oldContact) {
        if (oldEntry.iou.iou_type === 'receivable') {
          oldContact.total_receivable -= oldEntry.iou.iou_action === 'create' ? oldEntry.amount : -oldEntry.amount;
        } else if (oldEntry.iou.iou_type === 'debt') {
          oldContact.total_debt -= oldEntry.iou.iou_action === 'create' ? oldEntry.amount : -oldEntry.amount;
        }
        await oldContact.save({ session });
      }
    }

    // Revert old payment method balance
    const oldMethod = await PaymentMethod.findOne({ name: oldEntry.payment_method }).session(session);
    if (oldMethod) {
      oldMethod.balance += oldEntry.type === 'cashin' ? -oldEntry.amount : oldEntry.amount;
      await oldMethod.save({ session });
    }

    // Build new IOU sub-document
    const iouSubDoc = parsed.data.iou
      ? {
          contact_id: parsed.data.iou.contactId,
          iou_type: parsed.data.iou.iouType,
          iou_action: parsed.data.iou.iouAction,
          details: parsed.data.iou.details || '',
        }
      : null;

    // Apply updates
    Object.assign(oldEntry, parsed.data);
    oldEntry.iou = iouSubDoc;
    await oldEntry.save({ session });

    // Apply new payment method balance
    const newMethod = await PaymentMethod.findOne({ name: parsed.data.payment_method }).session(session);
    if (newMethod) {
      newMethod.balance += type === 'cashin' ? parsed.data.amount : -parsed.data.amount;
      await newMethod.save({ session });
    }

    // Apply new IOU contact totals
    if (parsed.data.iou) {
      const newContact = await IOUContact.findById(parsed.data.iou.contactId).session(session);
      if (newContact) {
        if (parsed.data.iou.iouType === 'receivable') {
          newContact.total_receivable += parsed.data.iou.iouAction === 'create' ? parsed.data.amount : -parsed.data.amount;
        } else if (parsed.data.iou.iouType === 'debt') {
          newContact.total_debt += parsed.data.iou.iouAction === 'create' ? parsed.data.amount : -parsed.data.amount;
        }
        if (!newContact.primary_type) newContact.primary_type = parsed.data.iou.iouType;
        await newContact.save({ session });
      }
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  revalidatePath('/');
  revalidatePath('/ledger');
  revalidatePath('/debts');
  return { success: true };
}

export async function deleteEntry(type: 'expense' | 'cashin', id: string) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const entry = await Entry.findById(id).session(session);
    if (!entry) throw new Error('Entry not found');

    // Revert IOU contact totals
    if (entry.iou) {
      const contact = await IOUContact.findById(entry.iou.contact_id).session(session);
      if (contact) {
        if (entry.iou.iou_type === 'receivable') {
          contact.total_receivable -= entry.iou.iou_action === 'create' ? entry.amount : -entry.amount;
        } else if (entry.iou.iou_type === 'debt') {
          contact.total_debt -= entry.iou.iou_action === 'create' ? entry.amount : -entry.amount;
        }
        await contact.save({ session });
      }
    }

    // Revert payment method balance
    const method = await PaymentMethod.findOne({ name: entry.payment_method }).session(session);
    if (method) {
      method.balance += entry.type === 'cashin' ? -entry.amount : entry.amount;
      await method.save({ session });
    }

    await Entry.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  revalidatePath('/');
  revalidatePath('/ledger');
  revalidatePath('/debts');
  return { success: true };
}
