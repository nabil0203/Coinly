import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPaymentMethods } from '@/app/actions/payment';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const paymentMethods = await getPaymentMethods();
  const totalBalance = paymentMethods.reduce((acc: number, method: any) => acc + (Number(method.balance) || 0), 0);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <DashboardHeader username={user.username} balance={totalBalance} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
