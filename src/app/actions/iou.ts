'use server';

import dbConnect from '@/lib/db';
import IOUContact from '@/models/IOUContact';
import Entry from '@/models/Entry';
import { getCurrentUser } from '@/lib/auth';
import { ContactSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getIOUContacts() {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return [];

  const contacts = await IOUContact.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(contacts));
}

export async function getContactHistory(contactId: string) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return [];

  // IOU data is now embedded in Entry — query directly, no separate collection needed
  const entries = await Entry.find({ 'iou.contact_id': contactId })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  // Shape the response to match what the UI expects (same structure as old IOUTransaction + populated entry)
  const history = entries.map((e) => ({
    _id: e._id,
    contact: contactId,
    iou_type: e.iou?.iou_type,
    iou_action: e.iou?.iou_action,
    amount: e.amount,
    date: e.date,
    details: e.iou?.details,
    entry: e,
  }));

  return JSON.parse(JSON.stringify(history));
}

export async function createOrUpdateContact(name: string) {
  const parsed = ContactSchema.safeParse({ name });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let contact = await IOUContact.findOne({ name: parsed.data.name });
    if (!contact) {
      contact = await IOUContact.create({ name: parsed.data.name });
    }
    return JSON.parse(JSON.stringify(contact));
  } catch (error: unknown) {
    console.error('Error creating contact:', error);
    throw new Error((error as Error).message || 'Unknown error occurred while adding contact');
  }
}

export async function deleteIOUContact(contactId: string) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Disassociate entries that reference this contact (clear the inline iou sub-doc)
    await Entry.updateMany(
      { 'iou.contact_id': contactId },
      { $unset: { iou: '' } }
    );

    await IOUContact.deleteOne({ _id: contactId });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting contact:', error);
    throw new Error((error as Error).message || 'Failed to delete contact');
  }
}
