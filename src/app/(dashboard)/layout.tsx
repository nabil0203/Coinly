import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <DashboardHeader username={user.username} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
