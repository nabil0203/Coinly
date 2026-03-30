import React from 'react';
import { LedgerClient } from '@/components/LedgerClient';
import { getEntries } from '@/app/actions/ledger';
import { getPaymentMethods } from '@/app/actions/payment';

export default async function LedgerPage(props: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const now = new Date();
  const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth();
  const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();

  const ledgerData = await getEntries(month, year);
  const paymentMethods = await getPaymentMethods();

  return (
    <LedgerClient 
      initialData={ledgerData} 
      paymentMethods={paymentMethods}
      initialMonth={month}
      initialYear={year}
    />
  );
}
