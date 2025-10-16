"use client";

import { TicketDetails } from '@/components/tickets/TicketDetails';
import { TicketDetailsSkeleton } from '@/components/tickets/TicketDetailsSkeleton';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import type { Ticket, User } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { useEffect } from 'react';

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();
  const { user } = useUser();

  const ticketRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'tickets', id);
  }, [firestore, id]);

  const { data: ticket, isLoading: isTicketLoading, error: ticketError } = useDoc<Omit<Ticket, 'id'>>(ticketRef);

  const sellerRef = useMemoFirebase(() => {
    if (!firestore || !ticket?.postedBy) return null;
    return doc(firestore, 'users', ticket.postedBy);
  }, [firestore, ticket?.postedBy]);

  const { data: seller, isLoading: isSellerLoading } = useDoc<User>(sellerRef);

  useEffect(() => {
    if (ticketError) {
      console.error("Error fetching ticket:", ticketError);
    }
  }, [ticketError]);

  if (isTicketLoading || (ticket && isSellerLoading)) {
    return <TicketDetailsSkeleton />;
  }

  // Only call notFound if loading is complete and the ticket is confirmed to not exist.
  if (!isTicketLoading && !ticket) {
    notFound();
  }
  
  // This check prevents rendering with incomplete data
  if (!ticket) {
      return <TicketDetailsSkeleton />;
  }


  const ticketWithId: Ticket = { ...ticket, id: id };
  const currentBuyer = user ? { id: user.uid, name: user.displayName, email: user.email } : null;

  return (
    <div className="container mx-auto py-12">
      <TicketDetails 
        ticket={ticketWithId} 
        sellerName={seller?.name ?? 'Anonymous'} 
        buyer={currentBuyer}
      />
    </div>
  );
}
