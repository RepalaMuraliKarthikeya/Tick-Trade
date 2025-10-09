"use client";

import { UserProfile } from '@/components/profile/UserProfile';
import { useUser, useCollection, useFirestore } from '@/firebase';
import type { Ticket } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemoFirebase } from '@/firebase/provider';

export default function ProfilePage() {
  const { user, isUserLoading, userError } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const postedTicketsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'tickets'), where('postedBy', '==', user.uid));
  }, [firestore, user]);

  const purchasedTicketsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/purchased_tickets`);
  }, [firestore, user]);

  const { data: postedTickets, isLoading: isLoadingPosted } = useCollection<Ticket>(postedTicketsQuery);
  const { data: purchasedTickets, isLoading: isLoadingPurchased } = useCollection<Ticket>(purchasedTicketsQuery);

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto py-12">
        <div className="space-y-8">
          <header className="flex flex-col sm:flex-row items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          </header>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (userError) {
    return <div>Error loading user profile.</div>
  }

  const userProfile = {
    id: user.uid,
    name: user.displayName || 'Anonymous User',
    email: user.email,
  };

  return (
    <div className="container mx-auto py-12">
      <UserProfile
        user={userProfile}
        postedTickets={postedTickets || []}
        purchasedTickets={purchasedTickets || []}
        isLoading={isLoadingPosted || isLoadingPurchased}
      />
    </div>
  );
}
