"use client";

import { TicketDetails } from '@/components/tickets/TicketDetails';
import { useDoc, useFirestore, useUser } from '@/firebase';
import type { Ticket, User } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
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
  }, [firestore, ticket]);

  const { data: seller, isLoading: isSellerLoading } = useDoc<User>(sellerRef);

  useEffect(() => {
    if (ticketError) {
      console.error("Error fetching ticket:", ticketError);
    }
  }, [ticketError]);

  const isLoading = isTicketLoading || (ticket && isSellerLoading);

  if (isLoading) {
    return <TicketDetailsSkeleton />;
  }

  if (!ticket) {
    notFound();
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

function TicketDetailsSkeleton() {
  return (
    <div className="container mx-auto py-12">
      <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>
        <div className="md:col-span-3 space-y-6">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-12 w-3/4 rounded-md" />
          <Skeleton className="h-7 w-1/2 rounded-md" />
          <div className="my-8 border-t border-border/50 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
