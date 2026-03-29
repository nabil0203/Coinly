import React from 'react';
import { ProfileClient } from '@/components/ProfileClient';
import { getPaymentMethods } from '@/app/actions/payment';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function ProfilePage() {
  await dbConnect();
  const authUser = await getCurrentUser();
  if (!authUser) return null;

  const user = await User.findById(authUser.userId).lean();
  const paymentMethods = await getPaymentMethods();

  return (
    <ProfileClient 
      user={JSON.parse(JSON.stringify(user))} 
      paymentMethods={paymentMethods} 
    />
  );
}
