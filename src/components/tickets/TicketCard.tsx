import Link from 'next/link';
import Image from 'next/image';
import type { Ticket } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';

type TicketCardProps = {
  ticket: Ticket;
};

export function TicketCard({ ticket }: TicketCardProps) {
  const showDateTime = new Date(`${ticket.showDate}T${ticket.showTime}`);

  return (
    <Link href={`/tickets/${ticket.id}`} className="group block">
      <Card className="overflow-hidden h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-white/10">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={ticket.imageUrl}
            alt={ticket.movieName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={ticket.imageHint}
          />
           <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent"></div>
           <div className="absolute bottom-4 left-4 right-4">
             <h3 className="font-headline text-2xl font-bold truncate text-white">{ticket.movieName}</h3>
             <p className="text-sm text-white/80 font-medium truncate">{ticket.theaterName}</p>
           </div>
        </div>
        <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
                <div className="font-bold text-2xl text-accent">
                    ${ticket.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground"> / ticket</span>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <TicketIcon className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{ticket.ticketCount} {ticket.ticketCount > 1 ? 'Tickets' : 'Ticket'}</span>
                </div>
            </div>
            
            <div className="border-t border-border/50 pt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{ticket.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{format(showDateTime, 'EEE, MMM d')} at {format(showDateTime, 'p')}</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
