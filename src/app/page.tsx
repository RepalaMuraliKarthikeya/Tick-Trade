"use client";

import { useState, useMemo } from 'react';
import { TicketList } from '@/components/tickets/TicketList';
import { SearchBar } from '@/components/tickets/SearchBar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Ticket } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

export default function Home() {
  const firestore = useFirestore();

  const ticketsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tickets');
  }, [firestore]);

  const availableTicketsQuery = useMemoFirebase(() => {
    if (!ticketsCollection) return null;
    return query(ticketsCollection, where('status', '==', 'available'));
  }, [ticketsCollection]);

  const { data: allAvailableTickets, isLoading } = useCollection<Omit<Ticket, 'id'>>(availableTicketsQuery);
  
  const [localTickets, setLocalTickets] = useState<Ticket[] | null>(null);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[] | null>(null);

  const ticketsToDisplay = useMemo(() => {
    const baseTickets = localTickets ?? allAvailableTickets;
    const sourceTickets = filteredTickets !== null ? filteredTickets : baseTickets;
    
    if (!sourceTickets) {
      return [];
    }
    
    return sourceTickets.map(t => ({ ...t, id: (t as any).id || '' }));
  }, [filteredTickets, allAvailableTickets, localTickets]);

  const handleSearch = (searchQuery: string) => {
    const baseTickets = localTickets ?? allAvailableTickets;
    if (!baseTickets) {
      setFilteredTickets([]);
      return;
    }

    if (!searchQuery) {
      setFilteredTickets(null); 
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const results = baseTickets.filter(
      (ticket) =>
        ticket.movieName.toLowerCase().includes(lowercasedQuery) ||
        ticket.theaterName.toLowerCase().includes(lowercasedQuery) ||
        ticket.location.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredTickets(results);
  };
  
  const handlePurchaseSuccess = (purchasedTicketId: string) => {
    const baseTickets = localTickets ?? allAvailableTickets;
    if (baseTickets) {
      const updatedTickets = baseTickets.map(ticket =>
        ticket.id === purchasedTicketId ? { ...ticket, status: 'sold' as 'sold' } : ticket
      ).filter(ticket => ticket.status === 'available');
      
      setLocalTickets(updatedTickets);

      if (filteredTickets) {
        const updatedFiltered = filteredTickets.map(ticket =>
          ticket.id === purchasedTicketId ? { ...ticket, status: 'sold' as 'sold' } : ticket
        ).filter(ticket => ticket.status === 'available');
        setFilteredTickets(updatedFiltered);
      }
    }
  };


  return (
    <>
      <section className="relative min-h-[50vh] md:min-h-[60vh] rounded-b-3xl overflow-hidden flex items-center justify-center text-center text-white -mt-20 pt-20">
        <Image 
          src={PlaceHolderImages[0].imageUrl} 
          alt={PlaceHolderImages[0].description}
          fill
          priority
          className="object-cover"
          data-ai-hint={PlaceHolderImages[0].imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative z-10 max-w-3xl p-4 -mt-12">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Never Miss a Movie Night
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-white/80">
            Buy and sell last-minute movie tickets. Your sold-out show is just a click away.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-4xl font-headline font-bold">Available Tickets</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <SearchBar onSearch={handleSearch} />
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
              <Link href="/post-ticket">Post Ticket</Link>
            </Button>
          </div>
        </div>
        <TicketList tickets={ticketsToDisplay} isLoading={isLoading} onPurchaseSuccess={handlePurchaseSuccess} />
      </div>
    </>
  );
}
