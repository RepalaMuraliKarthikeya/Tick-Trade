
'use client';

import type { Ticket, User } from '@/lib/types';
import { Banknote, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

type TicketPurchaseDialogProps = {
  ticket: Ticket;
  buyer: User | null;
  children: React.ReactNode;
  onPurchaseSuccess: (ticket: Ticket) => void;
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

export function TicketPurchaseDialog({ ticket, buyer, children, onPurchaseSuccess }: TicketPurchaseDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isPaying, setIsPaying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const handlePayment = async (paymentMethod: string) => {
    if (!buyer) {
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

    // Simulate payment processing with a 2-second delay
    setTimeout(() => {
      toast({
        title: 'Payment Successful!',
        description: `You've purchased ${ticket.ticketCount} ticket(s) for ${ticket.movieName}.`,
      });
      
      const soldTicket = { ...ticket, status: 'sold' as 'sold' };
      onPurchaseSuccess(soldTicket);

      // Reset state and close dialog
      setIsPaying(false);
      setSelectedPaymentMethod(null);
      setIsDialogOpen(false);
    }, 2000);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (ticket.status === 'sold' || buyer?.id === ticket.postedBy) {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: ticket.status === 'sold' ? 'Ticket Sold' : 'Cannot Buy Own Ticket',
        description:
          ticket.status === 'sold'
            ? 'This ticket is no longer available.'
            : 'You cannot purchase a ticket you have posted.',
      });
      return;
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild onClick={handleTriggerClick}>
        {children}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl">
            Confirm Purchase
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to purchase {ticket.ticketCount} ticket(s) for{' '}
            {ticket.movieName}. Choose a payment method to proceed. Total: ₹
            {(ticket.ticketPrice * ticket.ticketCount).toFixed(2)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          <p className="font-semibold">Select Payment Method</p>
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
  );
}
