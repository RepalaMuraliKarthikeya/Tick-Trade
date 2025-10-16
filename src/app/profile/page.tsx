"use client";

import { UserProfile } from '@/components/profile/UserProfile';
import { useUser, useCollection, useFirestore } from '@/firebase';
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
      const q = query(collection(firestore, 'tickets'), where('postedBy', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setPostedTickets(tickets);
      setIsLoadingPosted(false);
    }
  }, [user, firestore]);

  const fetchPurchasedTickets = useCallback(async () => {
    if (user && firestore) {
      setIsLoadingPurchased(true);
      const purchasedCollectionRef = collection(firestore, `users/${user.uid}/purchased_tickets`);
      const purchasedSnapshot = await getDocs(purchasedCollectionRef);
      
      const ticketPromises = purchasedSnapshot.docs.map(async (transactionDoc) => {
        const transactionData = transactionDoc.data() as Omit<Transaction, 'id'>;
        if (transactionData.ticketId) {
          const ticketRef = doc(firestore, 'tickets', transactionData.ticketId);
          const ticketSnap = await getDoc(ticketRef);
          if (ticketSnap.exists()) {
            return { id: ticketSnap.id, ...ticketSnap.data() } as Ticket;
          }
        }
        return null;
      });

      const tickets = (await Promise.all(ticketPromises)).filter((t): t is Ticket => t !== null);
      setPurchasedTickets(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newTickets = tickets.filter(t => !existingIds.has(t.id));
        return [...prev, ...newTickets];
      });
      setIsLoadingPurchased(false);
    }
  }, [user, firestore]);
  
  const handlePurchaseSuccess = useCallback(async (purchasedTicketId: string) => {
    if (firestore) {
      const ticketRef = doc(firestore, 'tickets', purchasedTicketId);
      const ticketSnap = await getDoc(ticketRef);
      if (ticketSnap.exists()) {
        const newPurchasedTicket = { id: ticketSnap.id, ...ticketSnap.data() } as Ticket;
        setPurchasedTickets(prev => [...prev, newPurchasedTicket]);
        
        // Also remove it from posted tickets if it was posted by this user
        setPostedTickets(prev => prev.map(t => t.id === purchasedTicketId ? { ...t, status: 'sold' } : t));
      }
    }
  }, [firestore]);


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
