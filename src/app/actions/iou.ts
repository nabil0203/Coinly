'use server';

import dbConnect from '@/lib/db';
import IOUContact from '@/models/IOUContact';
import IOUTransaction from '@/models/IOUTransaction';
import Entry from '@/models/Entry'; // Must import to register model for population
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getIOUContacts() {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return [];

  const contacts = await IOUContact.find({ user: user.userId }).sort({ name: 1 });

  // Auto-backfill primary_type for pre-existing contacts that don't have it set yet.
  // This helps identify which section settled contacts belong to.
  const needsBackfill = contacts.filter((c: any) => !c.primary_type);
  if (needsBackfill.length > 0) {
    await Promise.all(needsBackfill.map(async (contact: any) => {
      const tx = await IOUTransaction.findOne({ contact: contact._id, user: user.userId }).sort({ date: 1, createdAt: 1 });
      if (tx) {
        contact.primary_type = tx.iou_type;
        await contact.save();
      }
    }));
  }

  return JSON.parse(JSON.stringify(contacts));
}

export async function getContactHistory(contactId: string) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return [];

  const history = await IOUTransaction.find({ 
    contact: contactId, 
    user: user.userId 
  }).populate('entry').sort({ date: -1, createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(history));
}

export async function createOrUpdateContact(name: string) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let contact = await IOUContact.findOne({ name, user: user.userId });
    if (!contact) {
      contact = await IOUContact.create({ name, user: user.userId });
    }
    return JSON.parse(JSON.stringify(contact));
  } catch (error: any) {
    console.error('Error creating contact:', error);
    throw new Error(error.message || 'Unknown error occurred while adding contact');
  }
}
export async function deleteIOUContact(contactId: string) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Delete all transactions first
    const transactions = await IOUTransaction.find({ contact: contactId, user: user.userId });
    const entryIds = transactions.map((t: any) => t.entry);

    // Disassociate ledger entries (optional but cleaner)
    await Entry.updateMany(
      { _id: { $in: entryIds }, user: user.userId },
      { $set: { is_iou: false, iou_details: null } }
    );

    // Delete transactions and contact
    await IOUTransaction.deleteMany({ contact: contactId, user: user.userId });
    await IOUContact.deleteOne({ _id: contactId, user: user.userId });

    revalidatePath('/', 'layout'); // Invalidates all routes so EntryModal contact lists refresh everywhere
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    throw new Error(error.message || 'Failed to delete contact');
  }
}
