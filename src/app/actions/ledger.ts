'use server';

import dbConnect from '@/lib/db';
import Entry from '@/models/Entry';
import PaymentMethod from '@/models/PaymentMethod';
import IOUContact from '@/models/IOUContact';
import IOUTransaction from '@/models/IOUTransaction';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Helper for IOU side-effects
async function handleIOUEffect(entry: any, iouData: any, isReversal = false) {
  const { contactId, iouType, iouAction, details } = iouData;
  const contact = await IOUContact.findById(contactId);
  if (!contact) return;

  const multiplier = isReversal ? -1 : 1;
  const amount = entry.amount * multiplier;

  console.log(`[IOU] Applying effect: ${iouType} ${iouAction} reversal=${isReversal} name=${contact.name} amount=${amount}`);
  if (iouType === 'receivable') {
    contact.total_receivable += (iouAction === 'create' ? amount : -amount);
  } else if (iouType === 'debt') {
    contact.total_debt += (iouAction === 'create' ? amount : -amount);
  }
  // Lock in the primary section on the very first transaction
  if (!contact.primary_type) {
    contact.primary_type = iouType;
  }
  await contact.save();
  console.log(`[IOU] Contact balance updated: receivable=${contact.total_receivable} debt=${contact.total_debt}`);

  if (isReversal) {
    const delResult = await IOUTransaction.deleteOne({ entry: entry._id });
    console.log(`[IOU] Transaction deleted for entry ${entry._id}:`, delResult);
  } else {
    await IOUTransaction.create({
      contact: contactId,
      entry: entry._id,
      iou_type: iouType,
      iou_action: iouAction,
      amount: entry.amount,
      date: entry.date,
      user: entry.user,
      details: details // Save the extra details
    });
  }
}

export async function getEntries(month: number, year: number) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return { expenses: {}, cashin: {}, prevBalance: 0 };

  const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-31`;

  // Fetch entries for the current month view
  let entriesQuery = Entry.find({
    user: user.userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  })
  .sort({ date: 1, createdAt: 1 })
  .populate({ path: 'iou_details', strictPopulate: false });

  const entries = await entriesQuery.lean();

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
    grouped[typeKey][date].push(e);
  });

  // 1. Get current total balance of all payment methods
  const methods = await PaymentMethod.find({ user: user.userId }).lean();
  const totalCurrentBalance = methods.reduce((acc: number, m: any) => acc + (Number(m.balance) || 0), 0);

  // 2. Calculate net sum of entries from startOfMonth until now (infinity) using MongoDB Aggregation
  const normalizeDate = (d: string) => {
    const parts = d.split('-');
    if (parts.length !== 3) return d;
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  };

  const normalizedStart = normalizeDate(startOfMonth);

  const aggregationResult = await Entry.aggregate([
    {
      $match: {
        user: user.userId,
        // Using string comparison since dates are stored as YYYY-MM-DD
        date: { $gte: normalizedStart }
      }
    },
    {
      $group: {
        _id: null,
        totalCashin: {
          $sum: { $cond: [{ $eq: ["$type", "cashin"] }, "$amount", 0] }
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
        }
      }
    }
  ]);

  const futureNet = aggregationResult.length > 0 
    ? aggregationResult[0].totalCashin - aggregationResult[0].totalExpense
    : 0;

  const prevBalance = totalCurrentBalance - futureNet;
  

  return JSON.parse(JSON.stringify({ ...grouped, prevBalance }));
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
      user: user.userId,
      is_iou: !!p.iou
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

    // Handle IOU logic
    if (p.iou) {
      await handleIOUEffect(entry, p.iou);
      const iouTx = await IOUTransaction.findOne({ entry: entry._id }).select('_id');
      if (iouTx) {
          await Entry.findByIdAndUpdate(entry._id, { iou_details: iouTx._id });
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/ledger');
  revalidatePath('/debts');
  return { success: true };
}

export async function updateEntry(type: 'expense' | 'cashin', id: string, payload: any) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const oldEntry = await Entry.findOne({ _id: id, user: user.userId });
  if (!oldEntry) throw new Error('Entry not found');

  // Revert old IOU effect first
  if (oldEntry.is_iou) {
    const oldTransaction = await IOUTransaction.findOne({ entry: oldEntry._id });
    if (oldTransaction) {
        await handleIOUEffect(oldEntry, {
            contactId: oldTransaction.contact,
            iouType: oldTransaction.iou_type,
            iouAction: oldTransaction.iou_action
        }, true);
    }
  }

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
  oldEntry.is_iou = !!payload.iou;
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

  // Apply new IOU effect
  if (payload.iou) {
    await handleIOUEffect(oldEntry, payload.iou);
    const iouTx = await IOUTransaction.findOne({ entry: oldEntry._id }).select('_id');
    oldEntry.iou_details = iouTx?._id;
    await oldEntry.save();
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

  const entry = await Entry.findOne({ _id: id, user: user.userId });
  if (!entry) throw new Error('Entry not found');

  // Revert IOU effect
  // We check for transaction existence as a fallback even if flag is missing
  console.log(`[IOU] Checking entry ${id} for IOU reversal...`);
  const iouTx = await IOUTransaction.findOne({ entry: entry._id });
  if (iouTx) {
      console.log(`[IOU] Found associated transaction ${iouTx._id}. Reverting...`);
      await handleIOUEffect(entry, {
          contactId: iouTx.contact,
          iouType: iouTx.iou_type,
          iouAction: iouTx.iou_action
      }, true);
  } else if (entry.is_iou) {
      console.log(`[IOU] entry.is_iou is true but no transaction found for ${entry._id}`);
  }

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
  revalidatePath('/debts');
  return { success: true };
}
