/**
 * Financial logic tests for Coinly ledger actions.
 *
 * These tests cover the highest-risk operations:
 *  - addEntry: creates an entry and updates payment method balance
 *  - deleteEntry: reverts balance and IOU side-effects
 *  - IOU reversal: handleIOUEffect called via addEntry/deleteEntry
 *
 * Auth (getCurrentUser) and Next.js APIs (revalidatePath, cookies) are mocked.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';

// ─── Mock Next.js APIs that can't run outside the framework ──────────────────
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'mock-token' })),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// ─── Mock auth to return a fixed test user ───────────────────────────────────
const TEST_USER_ID = new mongoose.Types.ObjectId().toString();
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(() => Promise.resolve({ userId: TEST_USER_ID, username: 'testuser' })),
  signToken: vi.fn(),
  setAuthCookie: vi.fn(),
  removeAuthCookie: vi.fn(),
}));

// ─── Mock db.ts to skip real connection (setup.ts handles it) ────────────────
vi.mock('@/lib/db', () => ({ default: vi.fn(() => Promise.resolve()) }));

// ─── Import models and actions AFTER mocks are in place ──────────────────────
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
import Entry from '@/models/Entry';
import IOUContact from '@/models/IOUContact';
import IOUTransaction from '@/models/IOUTransaction';
import { addEntry, deleteEntry, updateEntry } from '@/app/actions/ledger';

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function createTestUser() {
  return User.create({
    _id: new mongoose.Types.ObjectId(TEST_USER_ID),
    full_name: 'Test User',
    username: 'testuser',
    email: 'test@coinly.test',
    password: 'hashed-password',
  });
}

async function createPaymentMethod(name = 'Cash', balance = 1000) {
  return PaymentMethod.create({ name, balance, user: TEST_USER_ID });
}

async function createIOUContact(name = 'Alice') {
  return IOUContact.create({ name, user: TEST_USER_ID });
}

// ─── Test Suites ─────────────────────────────────────────────────────────────

describe('addEntry — expense', () => {
  beforeEach(async () => {
    await createTestUser();
    await createPaymentMethod('Cash', 1000);
  });

  it('creates an entry in the database', async () => {
    await addEntry('expense', {
      amount: 200,
      description: 'Lunch',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const entries = await Entry.find({ user: TEST_USER_ID });
    expect(entries).toHaveLength(1);
    expect(entries[0].amount).toBe(200);
    expect(entries[0].type).toBe('expense');
  });

  it('deducts amount from payment method balance', async () => {
    await addEntry('expense', {
      amount: 300,
      description: 'Groceries',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const method = await PaymentMethod.findOne({ name: 'Cash', user: TEST_USER_ID });
    expect(method?.balance).toBe(700); // 1000 - 300
  });
});

describe('addEntry — cashin', () => {
  beforeEach(async () => {
    await createTestUser();
    await createPaymentMethod('Bank', 500);
  });

  it('creates a cashin entry', async () => {
    await addEntry('cashin', {
      amount: 2000,
      description: 'Salary',
      payment_method: 'Bank',
      date: '2026-05-01',
    });

    const entries = await Entry.find({ user: TEST_USER_ID });
    expect(entries[0].type).toBe('cashin');
  });

  it('adds amount to payment method balance', async () => {
    await addEntry('cashin', {
      amount: 2000,
      description: 'Salary',
      payment_method: 'Bank',
      date: '2026-05-01',
    });

    const method = await PaymentMethod.findOne({ name: 'Bank', user: TEST_USER_ID });
    expect(method?.balance).toBe(2500); // 500 + 2000
  });
});

describe('deleteEntry', () => {
  beforeEach(async () => {
    await createTestUser();
    await createPaymentMethod('Cash', 1000);
  });

  it('removes the entry from the database', async () => {
    await addEntry('expense', {
      amount: 100,
      description: 'Coffee',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const entry = await Entry.findOne({ user: TEST_USER_ID });
    expect(entry).not.toBeNull();

    await deleteEntry('expense', entry!._id.toString());

    const remaining = await Entry.find({ user: TEST_USER_ID });
    expect(remaining).toHaveLength(0);
  });

  it('restores payment method balance after expense deletion', async () => {
    await addEntry('expense', {
      amount: 400,
      description: 'Rent partial',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    // Balance should be 600 after expense
    const afterAdd = await PaymentMethod.findOne({ name: 'Cash', user: TEST_USER_ID });
    expect(afterAdd?.balance).toBe(600);

    const entry = await Entry.findOne({ user: TEST_USER_ID });
    await deleteEntry('expense', entry!._id.toString());

    // Balance should be restored to 1000
    const afterDelete = await PaymentMethod.findOne({ name: 'Cash', user: TEST_USER_ID });
    expect(afterDelete?.balance).toBe(1000);
  });
});

describe('IOU side-effects', () => {
  beforeEach(async () => {
    await createTestUser();
    await createPaymentMethod('Cash', 5000);
  });

  it('increments contact total_receivable when an IOU receivable is created', async () => {
    const contact = await createIOUContact('Bob');

    await addEntry('cashin', {
      amount: 500,
      description: 'Loan to Bob',
      payment_method: 'Cash',
      date: '2026-05-01',
      iou: {
        contactId: contact._id.toString(),
        iouType: 'receivable',
        iouAction: 'create',
      },
    });

    const updated = await IOUContact.findById(contact._id);
    expect(updated?.total_receivable).toBe(500);
    expect(updated?.total_debt).toBe(0);
  });

  it('sets primary_type on the first IOU transaction for a contact', async () => {
    const contact = await createIOUContact('Carol');

    await addEntry('cashin', {
      amount: 200,
      description: 'Lent Carol money',
      payment_method: 'Cash',
      date: '2026-05-01',
      iou: {
        contactId: contact._id.toString(),
        iouType: 'receivable',
        iouAction: 'create',
      },
    });

    const updated = await IOUContact.findById(contact._id);
    expect(updated?.primary_type).toBe('receivable');
  });

  it('creates an IOUTransaction record on addEntry with IOU data', async () => {
    const contact = await createIOUContact('Dave');

    await addEntry('expense', {
      amount: 300,
      description: 'Paid Dave\'s bill',
      payment_method: 'Cash',
      date: '2026-05-01',
      iou: {
        contactId: contact._id.toString(),
        iouType: 'debt',
        iouAction: 'create',
      },
    });

    const txs = await IOUTransaction.find({ user: TEST_USER_ID });
    expect(txs).toHaveLength(1);
    expect(txs[0].iou_type).toBe('debt');
    expect(txs[0].amount).toBe(300);
  });

  it('reverses IOU contact balance on deleteEntry', async () => {
    const contact = await createIOUContact('Eve');

    await addEntry('cashin', {
      amount: 1000,
      description: 'Lent Eve money',
      payment_method: 'Cash',
      date: '2026-05-01',
      iou: {
        contactId: contact._id.toString(),
        iouType: 'receivable',
        iouAction: 'create',
      },
    });

    // Contact receivable should now be 1000
    const afterAdd = await IOUContact.findById(contact._id);
    expect(afterAdd?.total_receivable).toBe(1000);

    const entry = await Entry.findOne({ user: TEST_USER_ID });
    await deleteEntry('cashin', entry!._id.toString());

    // Contact receivable should be restored to 0
    const afterDelete = await IOUContact.findById(contact._id);
    expect(afterDelete?.total_receivable).toBe(0);

    // IOUTransaction should be deleted
    const txs = await IOUTransaction.find({ user: TEST_USER_ID });
    expect(txs).toHaveLength(0);
  });
});

describe('updateEntry', () => {
  beforeEach(async () => {
    await createTestUser();
    await createPaymentMethod('Cash', 1000);
    await createPaymentMethod('Bank', 2000);
  });

  it('correctly adjusts balance when amount changes', async () => {
    await addEntry('expense', {
      amount: 200,
      description: 'Original',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    // Cash should be 800 after expense
    const entry = await Entry.findOne({ user: TEST_USER_ID });
    await updateEntry('expense', entry!._id.toString(), {
      amount: 500,
      description: 'Updated',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const method = await PaymentMethod.findOne({ name: 'Cash', user: TEST_USER_ID });
    expect(method?.balance).toBe(500); // 1000 - 500
  });

  it('correctly moves balance when payment method changes', async () => {
    await addEntry('expense', {
      amount: 300,
      description: 'Original on Cash',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const entry = await Entry.findOne({ user: TEST_USER_ID });
    await updateEntry('expense', entry!._id.toString(), {
      amount: 300,
      description: 'Updated on Bank',
      payment_method: 'Bank',
      date: '2026-05-01',
    });

    const cash = await PaymentMethod.findOne({ name: 'Cash', user: TEST_USER_ID });
    const bank = await PaymentMethod.findOne({ name: 'Bank', user: TEST_USER_ID });

    expect(cash?.balance).toBe(1000); // fully restored
    expect(bank?.balance).toBe(1700); // 2000 - 300
  });
});
