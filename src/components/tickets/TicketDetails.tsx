'use client';

import Image from 'next/image';
import type { Ticket, Transaction, User } from '@/lib/types';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket as TicketIcon,
  User as UserIcon,
  CreditCard,
  Banknote,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { doc, collection, writeBatch } from 'firebase/firestore';

type TicketDetailsProps = {
  ticket: Ticket;
  sellerName: string;
  buyer: User | null;
};

const paymentMethods = [
  {
    name: 'PhonePe / UPI',
    icon: <Banknote className="h-6 w-6" />,
  },
  {
    name: 'Google Pay',
    icon: (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
      >
        <title>Google Pay</title>
        <path
          d="M19.365 9.686l-2.074-2.075a.31.31 0 00-.464 0l-3.26 3.26-3.23-3.23a.309.309 0 00-.464 0L7.799 9.752a.31.31 0 000 .464l2.046 2.046-2.046 2.046a.31.31 0 000 .464l2.074 2.074a.31.31 0 00.464 0l3.26-3.26 3.23 3.23a.31.31 0 00.464 0l2.074-2.074a.31.31 0 000-.464l-2.046-2.046 2.046-2.046a.326.326 0 000-.464z"
          fill="#367af6"
        />
      </svg>
    ),
  },
  {
    name: 'Credit / Debit Card',
    icon: <CreditCard className="h-6 w-6" />,
  },
];

export function TicketDetails({ ticket, sellerName, buyer }: TicketDetailsProps) {
  const showDateTime = new Date(ticket.dateTime);
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const [isPaying, setIsPaying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const handlePayment = async (paymentMethod: string) => {
    if (!buyer || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to purchase a ticket.',
      });
      router.push('/login');
      return;
    }

    if (buyer.id === ticket.postedBy) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You cannot purchase your own ticket.',
      });
      return;
    }

    setIsPaying(true);
    setSelectedPaymentMethod(paymentMethod);

    setTimeout(async () => {
      try {
        const batch = writeBatch(firestore);
        const ticketRef = doc(firestore, 'tickets', ticket.id);
        batch.update(ticketRef, { status: 'sold' });

        const transactionRef = doc(collection(firestore, 'transactions'));
        const newTransaction: Omit<Transaction, 'id'> = {
          ticketId: ticket.id,
          buyerId: buyer.id,
          sellerId: ticket.postedBy,
          paymentMethod,
          transactionDate: new Date().toISOString(),
          amount: ticket.ticketPrice * ticket.ticketCount,
        };

        batch.set(transactionRef, newTransaction);

        const userPurchasedRef = doc(
          firestore,
          `users/${buyer.id}/purchased_tickets/${transactionRef.id}`
        );
        batch.set(userPurchasedRef, { ...newTransaction, id: transactionRef.id });

        await batch.commit();

        toast({
          title: 'Payment Successful!',
          description: `You've purchased ${ticket.ticketCount} ticket(s) for ${ticket.movieName}.`,
        });

        router.push('/profile');
      } catch (error) {
        console.error('Transaction failed:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Could not complete the purchase. Please try again.',
        });
      } finally {
        setIsPaying(false);
        setIsDialogOpen(false);
        setSelectedPaymentMethod(null);
      }
    }, 2000);
  };

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
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
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
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline text-2xl">
                    Confirm Purchase
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to purchase {ticket.ticketCount} ticket(s) for {ticket.movieName}.
                    Choose a payment method to proceed.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-4">
                  <p className="font-semibold">Select Payment Method (Mock)</p>
                  <div className="flex flex-col gap-3">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.name}
                        variant="outline"
                        className="justify-start gap-4 h-14 text-lg"
                        onClick={() => handlePayment(method.name)}
                        disabled={isPaying}
                      >
                        {isPaying && selectedPaymentMethod === method.name ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          method.icon
                        )}
                        {method.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <AlertDialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isPaying}
                  >
                    Cancel
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
