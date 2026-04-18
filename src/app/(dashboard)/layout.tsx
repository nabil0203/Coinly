import React from 'react';
import { Header } from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPaymentMethods } from '@/app/actions/payment';
import { AutoLogout } from '@/components/AutoLogout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, paymentMethods] = await Promise.all([
    getCurrentUser(),
    getPaymentMethods(),
  ]);

  if (!user) {
    redirect('/login');
  }

  const totalBalance = paymentMethods.reduce((acc: number, method: { balance?: number }) => acc + (Number(method.balance) || 0), 0);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0F172A] text-[#F8FAFC] overflow-hidden">
      <AutoLogout />
      <Header username={user.username} balance={totalBalance} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
