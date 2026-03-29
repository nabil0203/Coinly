import React from 'react';
import { HomeClient } from '@/components/HomeClient';
import { getPaymentMethods } from '@/app/actions/payment';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function HomePage() {
  await dbConnect();
  const authUser = await getCurrentUser();
  if (!authUser) return null;

  const user = await User.findById(authUser.userId).lean();
  const paymentMethods = await getPaymentMethods();

  const displayName = user?.full_name || user?.username || 'Friend';

  return (
    <HomeClient 
      displayName={displayName} 
      paymentMethods={paymentMethods} 
    />
  );
}
