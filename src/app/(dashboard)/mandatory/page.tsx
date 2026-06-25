import React from 'react';
import { getMandatoryExpenses } from '@/app/actions/essentials';
import { getPaymentMethods } from '@/app/actions/payment';
import { MandatoryExpensePage } from '@/components/MandatoryExpense/MandatoryExpensePage';

export const metadata = {
  title: 'Mandatory Expenses | Coinly',
  description: 'Manage and track your recurring monthly mandatory expenses.',
};

export default async function MandatoryPage() {
  const [items, paymentMethods] = await Promise.all([
    getMandatoryExpenses(),
    getPaymentMethods(),
  ]);

  return (
    <MandatoryExpensePage
      initialItems={items}
      paymentMethods={paymentMethods}
    />
  );
}
