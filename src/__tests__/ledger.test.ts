/**
 * Financial logic tests for Coinly ledger actions.
 *
 * These tests cover the highest-risk operations:
 *  - addEntry: creates an entry and updates payment method balance
 *  - deleteEntry: reverts balance and IOU side-effects
 *  - IOU reversal: contact totals updated via addEntry/deleteEntry
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
import PaymentMethod from '@/models/PaymentMethod';
import Entry from '@/models/Entry';
import IOUContact from '@/models/IOUContact';
import { addEntry, deleteEntry, updateEntry } from '@/app/actions/ledger';

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function createPaymentMethod(name = 'Cash', balance = 1000) {
  return PaymentMethod.create({ name, balance });
}

async function createIOUContact(name = 'Alice') {
  return IOUContact.create({ name });
}

// ─── Test Suites ─────────────────────────────────────────────────────────────

describe('addEntry — expense', () => {
  beforeEach(async () => {
    await createPaymentMethod('Cash', 1000);
  });

  it('creates an entry in the database', async () => {
    await addEntry('expense', {
      amount: 200,
      description: 'Lunch',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const entries = await Entry.find({});
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

    const method = await PaymentMethod.findOne({ name: 'Cash' });
    expect(method?.balance).toBe(700); // 1000 - 300
  });
});

describe('addEntry — cashin', () => {
  beforeEach(async () => {
    await createPaymentMethod('Bank', 500);
  });

  it('creates a cashin entry', async () => {
    await addEntry('cashin', {
      amount: 2000,
      description: 'Salary',
      payment_method: 'Bank',
      date: '2026-05-01',
    });

    const entries = await Entry.find({});
    expect(entries[0].type).toBe('cashin');
  });

  it('adds amount to payment method balance', async () => {
    await addEntry('cashin', {
      amount: 2000,
      description: 'Salary',
      payment_method: 'Bank',
      date: '2026-05-01',
    });

    const method = await PaymentMethod.findOne({ name: 'Bank' });
    expect(method?.balance).toBe(2500); // 500 + 2000
  });
});

describe('deleteEntry', () => {
  beforeEach(async () => {
    await createPaymentMethod('Cash', 1000);
  });

  it('removes the entry from the database', async () => {
    await addEntry('expense', {
      amount: 100,
      description: 'Coffee',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const entry = await Entry.findOne({});
    expect(entry).not.toBeNull();

    await deleteEntry('expense', entry!._id.toString());

    const remaining = await Entry.find({});
    expect(remaining).toHaveLength(0);
  });

  it('restores payment method balance after expense deletion', async () => {
    await addEntry('expense', {
      amount: 400,
      description: 'Rent partial',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const afterAdd = await PaymentMethod.findOne({ name: 'Cash' });
    expect(afterAdd?.balance).toBe(600);

    const entry = await Entry.findOne({});
    await deleteEntry('expense', entry!._id.toString());

    const afterDelete = await PaymentMethod.findOne({ name: 'Cash' });
    expect(afterDelete?.balance).toBe(1000);
  });
});

describe('IOU side-effects', () => {
  beforeEach(async () => {
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

  it('embeds IOU data inside the Entry document', async () => {
    const contact = await createIOUContact('Dave');

    await addEntry('expense', {
      amount: 300,
      description: "Paid Dave's bill",
      payment_method: 'Cash',
      date: '2026-05-01',
      iou: {
        contactId: contact._id.toString(),
        iouType: 'debt',
        iouAction: 'create',
      },
    });

    const entry = await Entry.findOne({});
    expect(entry?.iou).not.toBeNull();
    expect(entry?.iou?.iou_type).toBe('debt');
    expect(entry?.iou?.iou_action).toBe('create');
    expect(entry?.amount).toBe(300);
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

    const afterAdd = await IOUContact.findById(contact._id);
    expect(afterAdd?.total_receivable).toBe(1000);

    const entry = await Entry.findOne({});
    await deleteEntry('cashin', entry!._id.toString());

    const afterDelete = await IOUContact.findById(contact._id);
    expect(afterDelete?.total_receivable).toBe(0);

    // Entry should be gone
    const remaining = await Entry.find({});
    expect(remaining).toHaveLength(0);
  });
});

describe('updateEntry', () => {
  beforeEach(async () => {
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

    const entry = await Entry.findOne({});
    await updateEntry('expense', entry!._id.toString(), {
      amount: 500,
      description: 'Updated',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const method = await PaymentMethod.findOne({ name: 'Cash' });
    expect(method?.balance).toBe(500); // 1000 - 500
  });

  it('correctly moves balance when payment method changes', async () => {
    await addEntry('expense', {
      amount: 300,
      description: 'Original on Cash',
      payment_method: 'Cash',
      date: '2026-05-01',
    });

    const entry = await Entry.findOne({});
    await updateEntry('expense', entry!._id.toString(), {
      amount: 300,
      description: 'Updated on Bank',
      payment_method: 'Bank',
      date: '2026-05-01',
    });

    const cash = await PaymentMethod.findOne({ name: 'Cash' });
    const bank = await PaymentMethod.findOne({ name: 'Bank' });

    expect(cash?.balance).toBe(1000); // fully restored
    expect(bank?.balance).toBe(1700); // 2000 - 300
  });
});
