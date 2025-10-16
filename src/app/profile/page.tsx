
"use client";

import { UserProfile } from '@/components/profile/UserProfile';
import { useUser, useFirestore } from '@/firebase';
import type { Ticket, Transaction } from '@/lib/types';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, isUserLoading, userError } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [postedTickets, setPostedTickets] = useState<Ticket[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([]);
  const [isLoadingPosted, setIsLoadingPosted] = useState(true);
  const [isLoadingPurchased, setIsLoadingPurchased] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const fetchPostedTickets = useCallback(async () => {
    if (user && firestore) {
      setIsLoadingPosted(true);
      const q = query(collection(firestore, 'tickets'), where('postedBy', '==', user.uid), where('status', '==', 'available'));
      const querySnapshot = await getDocs(q);
      const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setPostedTickets(tickets);
      setIsLoadingPosted(false);
    }
  }, [user, firestore]);

  const fetchPurchasedTickets = useCallback(async () => {
    if (user && firestore) {
      setIsLoadingPurchased(true);
      // This part is for the dummy flow, we will assume no tickets are purchased initially from DB
      // In a real scenario, we would fetch from `users/${user.uid}/purchased_tickets`
      setPurchasedTickets([]);
      setIsLoadingPurchased(false);
    }
  }, [user, firestore]);
  
  const handlePurchaseSuccess = useCallback((newlyPurchasedTicket: Ticket) => {
    // Add to purchased tickets list if it's not already there
    setPurchasedTickets(prev => {
        const ticketExists = prev.some(t => t.id === newlyPurchasedTicket.id);
        if (!ticketExists) {
            return [...prev, newlyPurchasedTicket];
        }
        return prev;
    });

    // Remove from posted tickets list
    setPostedTickets(prev => prev.filter(t => t.id !== newlyPurchasedTicket.id));
  }, []);


  useEffect(() => {
    fetchPostedTickets();
    fetchPurchasedTickets();
  }, [fetchPostedTickets, fetchPurchasedTickets]);

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
        postedTickets={postedTickets}
        purchasedTickets={purchasedTickets}
        isLoading={isLoadingPosted || isLoadingPurchased}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  );
}
