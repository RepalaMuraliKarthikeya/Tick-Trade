'use client';

import Image from 'next/image';
import type { Ticket, User } from '@/lib/types';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket as TicketIcon,
  User as UserIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketPurchaseDialog } from './TicketPurchaseDialog';

type TicketDetailsProps = {
  ticket: Ticket;
  sellerName: string;
  buyer: User | null;
};


export function TicketDetails({ ticket, sellerName, buyer }: TicketDetailsProps) {
  const showDateTime = new Date(ticket.dateTime);

  return (
    <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
      <div className="md:col-span-2">
        <Card className="overflow-hidden sticky top-24 bg-card/50 backdrop-blur-sm border-white/10">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={ticket.posterImageUrl}
              alt={ticket.movieName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              data-ai-hint={ticket.imageHint}
            />
            {ticket.status === 'sold' && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-4xl font-bold text-red-500 transform -rotate-12 border-4 border-red-500 p-4 rounded-lg select-none">
                  SOLD
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="md:col-span-3">
        <Badge
          variant={ticket.status === 'available' ? 'default' : 'destructive'}
          className="mb-2 capitalize bg-accent text-accent-foreground"
        >
          {ticket.status}
        </Badge>

        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          {ticket.movieName}
        </h1>
        <p className="mt-2 text-xl text-muted-foreground">{ticket.theaterName}</p>

        <div className="my-8 border-t border-border/50 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
          <InfoItem icon={MapPin} label="Location" value={ticket.location} />
          <InfoItem icon={Calendar} label="Date" value={format(showDateTime, 'EEE, MMM d, yyyy')} />
          <InfoItem icon={Clock} label="Time" value={format(showDateTime, 'p')} />
          <InfoItem icon={TicketIcon} label="Quantity" value={`${ticket.ticketCount} Ticket(s)`} />
          <InfoItem icon={UserIcon} label="Seller" value={sellerName} />
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Total Price</CardTitle>
            <p className="text-4xl font-bold text-primary">
              ₹{(ticket.ticketPrice * ticket.ticketCount).toFixed(2)}
            </p>
          </CardHeader>

          <CardContent>
             <TicketPurchaseDialog ticket={ticket} buyer={buyer}>
                <Button
                  size="lg"
                  className="w-full text-lg"
                  disabled={ticket.status === 'sold' || buyer?.id === ticket.postedBy}
                >
                  {ticket.status === 'sold'
                    ? 'Sold Out'
                    : buyer?.id === ticket.postedBy
                    ? 'This is your ticket'
                    : 'Buy Ticket'}
                </Button>
              </TicketPurchaseDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
