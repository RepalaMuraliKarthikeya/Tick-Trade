
import Image from 'next/image';
import type { Ticket } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';
import { TicketPurchaseDialog } from './TicketPurchaseDialog';
import { useUser } from '@/firebase';

type TicketCardProps = {
  ticket: Ticket;
  onPurchaseSuccess: (ticket: Ticket) => void;
};

export function TicketCard({ ticket, onPurchaseSuccess }: TicketCardProps) {
  const showDateTime = new Date(ticket.dateTime);
  const { user } = useUser();

  const currentBuyer = user ? { id: user.uid, name: user.displayName, email: user.email } : null;

  return (
    <div className="group block">
      <Card className="overflow-hidden h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-white/10">
        <div className="block relative aspect-[2/3] w-full">
          <Image
            src={ticket.posterImageUrl}
            alt={ticket.movieName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={ticket.imageHint}
          />
           <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent"></div>
        </div>
        <CardContent className="p-4 space-y-3">
            <div className="min-h-[64px]">
              <TicketPurchaseDialog ticket={ticket} buyer={currentBuyer} onPurchaseSuccess={onPurchaseSuccess}>
                <h3 className="font-headline text-2xl font-bold truncate text-white cursor-pointer hover:text-primary transition-colors">
                  {ticket.movieName}
                </h3>
              </TicketPurchaseDialog>
              <p className="text-sm text-white/80 font-medium truncate">{ticket.theaterName}</p>
            </div>
            <div className="flex justify-between items-center">
                <div className="font-bold text-2xl text-accent">
                    ₹{ticket.ticketPrice.toFixed(2)}
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
    </div>
  );
}
