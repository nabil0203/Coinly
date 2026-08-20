/**
 * One-time migration: multi-tenant to single-user schema
 *
 * What this does:
 *  1. Embeds IOUTransaction data as Entry.iou sub-documents
 *  2. Strips `user`, `is_iou`, `iou_details` from Entry docs
 *  3. Strips `user` from PaymentMethod docs
 *  4. Strips `user` from IOUContact docs
 *  5. Drops the IOUTransactions collection
 *
 * Run ONCE before deploying new code:
 *   node scripts/migrate-to-simple.mjs
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coinly';

async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db();

  const entries        = db.collection('entries');
  const paymentMethods = db.collection('paymentmethods');
  const iouContacts    = db.collection('ioucontacts');
  const iouTxs         = db.collection('ioutransactions');

  // Step 1: Embed IOUTransaction data into Entry.iou
  console.log('\n Step 1: Embedding IOU transactions into entries...');
  const txCursor = iouTxs.find({});
  let embedded = 0;
  let skipped = 0;

  while (await txCursor.hasNext()) {
    const tx = await txCursor.next();
    const result = await entries.updateOne(
      { _id: tx.entry },
      {
        $set: {
          iou: {
            contact_id: tx.contact,
            iou_type:   tx.iou_type,
            iou_action: tx.iou_action,
            details:    tx.details || '',
          },
        },
      }
    );
    if (result.matchedCount === 0) {
      console.warn('  Orphaned IOUTransaction:', tx._id.toString());
      skipped++;
    } else {
      embedded++;
    }
  }
  console.log('   Embedded:', embedded, '| Orphaned/Skipped:', skipped);

  // Step 2: Strip old fields from entries
  console.log('\n Step 2: Stripping old fields from entries...');
  const entryResult = await entries.updateMany({}, { $unset: { user: '', is_iou: '', iou_details: '' } });
  console.log('   Modified:', entryResult.modifiedCount, 'entries');

  // Step 3: Strip user from paymentmethods
  console.log('\n Step 3: Stripping user from paymentmethods...');
  const pmResult = await paymentMethods.updateMany({}, { $unset: { user: '' } });
  console.log('   Modified:', pmResult.modifiedCount, 'payment methods');

  // Step 4: Strip user from ioucontacts
  console.log('\n Step 4: Stripping user from ioucontacts...');
  const contactResult = await iouContacts.updateMany({}, { $unset: { user: '' } });
  console.log('   Modified:', contactResult.modifiedCount, 'contacts');

  // Step 5: Drop old user-scoped indexes
  console.log('\n Step 5: Dropping old indexes...');
  async function dropIndexSafe(col, name) {
    try { await col.dropIndex(name); console.log('   Dropped:', name, 'from', col.collectionName); }
    catch { console.log('   Not found (ok):', name); }
  }
  await dropIndexSafe(entries, 'user_1_date_1');
  await dropIndexSafe(entries, 'user_1_type_1');
  await dropIndexSafe(paymentMethods, 'name_1_user_1');
  await dropIndexSafe(iouContacts, 'name_1_user_1');

  // Step 6: Drop IOUTransactions collection
  console.log('\n Step 6: Dropping ioutransactions collection...');
  const colList = await db.listCollections({ name: 'ioutransactions' }).toArray();
  if (colList.length > 0) {
    await db.dropCollection('ioutransactions');
    console.log('   Dropped ioutransactions collection');
  } else {
    console.log('   Collection not found, skipping');
  }

  console.log('\n Migration complete!');
  await client.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
