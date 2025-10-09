"use client";

import type { Ticket } from '@/lib/types';
import { TicketCard } from './TicketCard';
import { Skeleton } from '../ui/skeleton';

type TicketListProps = {
  tickets: Ticket[] | null;
  isLoading: boolean;
};

export function TicketList({ tickets, isLoading }: TicketListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
            </div>
        ))}
      </div>
    );
  }

  if (tickets === null || tickets.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-semibold">No tickets found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
