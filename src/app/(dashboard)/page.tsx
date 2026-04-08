import React from 'react';
import { Home } from '@/components/Home';
import { getPaymentMethods } from '@/app/actions/payment';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function HomePage() {
  await dbConnect();
  const authUser = await getCurrentUser();
  if (!authUser) return null;

  const [user, paymentMethods] = await Promise.all([
    User.findById(authUser.userId).lean(),
    getPaymentMethods()
  ]);

  const displayName = user?.full_name || user?.username || 'Friend';

  return (
    <Home
      displayName={displayName}
      paymentMethods={paymentMethods}
    />
  );
}
