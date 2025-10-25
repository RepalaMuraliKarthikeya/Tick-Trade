
'use client';

import type { Ticket, User, Transaction } from '@/lib/types';
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
import { useFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const { firestore } = useFirebase();

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

     if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }

    setIsPaying(true);
    setSelectedPaymentMethod(paymentMethod);

    try {
      // Create a batch write operation
      const batch = writeBatch(firestore);

      // 1. Update the ticket status to 'sold'
      const ticketRef = doc(firestore, 'tickets', ticket.id);
      batch.update(ticketRef, { status: 'sold' });

      // 2. Create a new transaction document
      const transactionRef = doc(collection(firestore, 'transactions'));
      const newTransaction: Omit<Transaction, 'id'> = {
        ticketId: ticket.id,
        buyerId: buyer.id,
        sellerId: ticket.postedBy,
        paymentMethod: paymentMethod,
        transactionDate: new Date().toISOString(),
        amount: ticket.ticketPrice * ticket.ticketCount,
      };
      batch.set(transactionRef, newTransaction);
      
      // 3. Add the transaction to the user's purchased_tickets subcollection
      const userPurchasedTicketRef = doc(collection(firestore, `users/${buyer.id}/purchased_tickets`));
      batch.set(userPurchasedTicketRef, { ...newTransaction, id: transactionRef.id });


      // Commit the batch
      await batch.commit();

      toast({
        title: 'Payment Successful!',
        description: `You've purchased ${ticket.ticketCount} ticket(s) for ${ticket.movieName}.`,
      });

      const soldTicket = { ...ticket, status: 'sold' as 'sold' };
      onPurchaseSuccess(soldTicket);

      setIsDialogOpen(false);

    } catch (error) {
      console.error('Payment failed:', error);
       // Create a detailed error for debugging
       const permissionError = new FirestorePermissionError({
        path: `BATCH WRITE on /tickets/${ticket.id} and others`,
        operation: 'write', 
        requestResourceData: { 
          ticketUpdate: { status: 'sold' },
          newTransaction: 'details omitted for brevity'
        }
      });

      // Emit the error so the listener can catch it
      errorEmitter.emit('permission-error', permissionError);

      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'Could not complete the purchase. Please try again.',
      });
    } finally {
      setIsPaying(false);
      setSelectedPaymentMethod(null);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (ticket.status === 'sold') {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Ticket Sold',
        description: 'This ticket is no longer available.',
      });
      return;
    }
     if (buyer && buyer.id === ticket.postedBy) {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Cannot Buy Own Ticket',
        description: 'You cannot purchase a ticket you have posted.',
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
