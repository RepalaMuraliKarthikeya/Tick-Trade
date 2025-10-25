
"use client";

import { UserProfile } from '@/components/profile/UserProfile';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Ticket, Transaction } from '@/lib/types';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemoFirebase } from '@/firebase/provider';

export default function ProfilePage() {
  const { user, isUserLoading, userError } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [postedTickets, setPostedTickets] = useState<Ticket[]>([]);
  const [isLoadingPosted, setIsLoadingPosted] = useState(true);

  // Use the useCollection hook for real-time updates on purchased tickets
  const purchasedTicketsQuery = useMemoFirebase(() => {
    if (user && firestore) {
      return query(collection(firestore, `users/${user.uid}/purchased_tickets`));
    }
    return null;
  }, [user, firestore]);

  const { data: purchasedTransactions, isLoading: isLoadingPurchasedTransactions } = useCollection<Transaction>(purchasedTicketsQuery);

  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([]);
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

  const fetchFullPurchasedTickets = useCallback(async () => {
    if (purchasedTransactions && firestore) {
      setIsLoadingPurchased(true);
      if (purchasedTransactions.length === 0) {
        setPurchasedTickets([]);
        setIsLoadingPurchased(false);
        return;
      }
      
      const ticketIds = purchasedTransactions.map(t => t.ticketId);
      const fetchedTickets: Ticket[] = [];
      
      // Firestore 'in' query is limited to 30 items. 
      // If you expect users to purchase more, you'd need to batch this.
      const ticketsQuery = query(collection(firestore, 'tickets'), where('__name__', 'in', ticketIds));
      const ticketSnapshots = await getDocs(ticketsQuery);
      
      ticketSnapshots.forEach(doc => {
        fetchedTickets.push({ id: doc.id, ...doc.data() } as Ticket);
      });

      setPurchasedTickets(fetchedTickets);
      setIsLoadingPurchased(false);
    } else if (!purchasedTransactions) {
      // Handle the case where there are no transactions yet
      setPurchasedTickets([]);
      setIsLoadingPurchased(false);
    }
  }, [purchasedTransactions, firestore]);

  const handlePurchaseSuccess = useCallback((purchasedTicket: Ticket) => {
    // This function will be called after a successful purchase.
    // The useCollection hook for purchased tickets will update automatically.
    // We just need to remove the ticket from the locally managed "posted" list.
    setPostedTickets(prev => prev.filter(t => t.id !== purchasedTicket.id));
  }, []);


  useEffect(() => {
    fetchPostedTickets();
  }, [fetchPostedTickets]);

  useEffect(() => {
    fetchFullPurchasedTickets();
  }, [fetchFullPurchasedTickets]);

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

  const isLoading = isLoadingPosted || isLoadingPurchasedTransactions || isLoadingPurchased;

  return (
    <div className="container mx-auto py-12">
      <UserProfile
        user={userProfile}
        postedTickets={postedTickets}
        purchasedTickets={purchasedTickets}
        isLoading={isLoading}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  );
}
