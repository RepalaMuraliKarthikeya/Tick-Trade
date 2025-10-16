'use client';

import type { Ticket, Transaction, User } from '@/lib/types';
import {
  Banknote,
  CreditCard,
  Loader2,
} from 'lucide-react';
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
import { useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';

type TicketPurchaseDialogProps = {
  ticket: Ticket;
  buyer: User | null;
  children: React.ReactNode;
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

export function TicketPurchaseDialog({ ticket, buyer, children }: TicketPurchaseDialogProps) {
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
        toast({
            variant: 'destructive',
            title: 'Database Error',
            description: 'Could not connect to the database.',
        });
        return;
    }

    setIsPaying(true);
    setSelectedPaymentMethod(paymentMethod);

    const batch = writeBatch(firestore);

    // 1. Create a new transaction document
    const transactionRef = doc(collection(firestore, 'transactions'));
    const newTransaction: Omit<Transaction, 'id'> & { transactionDate: any } = {
        ticketId: ticket.id,
        buyerId: buyer.id,
        sellerId: ticket.postedBy,
        paymentMethod: paymentMethod,
        transactionDate: serverTimestamp(),
        amount: ticket.ticketPrice * ticket.ticketCount,
    };
    batch.set(transactionRef, newTransaction);
    
    // 2. Add a record to the user's purchased_tickets subcollection
    const userPurchasedRef = doc(collection(firestore, `users/${buyer.id}/purchased_tickets`));
    const userPurchasedData = {
        ticketId: ticket.id,
        transactionId: transactionRef.id,
        purchaseDate: serverTimestamp(),
    };
    batch.set(userPurchasedRef, userPurchasedData);

    // 3. Update the ticket's status to 'sold'
    const ticketRef = doc(firestore, 'tickets', ticket.id);
    batch.update(ticketRef, { status: 'sold' });

    // Commit the batch and handle potential errors
    batch.commit()
      .then(() => {
          toast({
              title: 'Payment Successful!',
              description: `You've purchased ${ticket.ticketCount} ticket(s) for ${ticket.movieName}.`,
          });
          router.refresh();
          setIsDialogOpen(false);
      })
      .catch((error) => {
          console.error("Firestore batch write failed:", error);
          
          // This is a generic error handler for any failure during the batch write.
          const permissionError = new FirestorePermissionError({
              path: `transactions (batch operation)`,
              operation: 'write',
              requestResourceData: { 
                  ticketId: ticket.id, 
                  buyerId: buyer.id, 
                  ticketStatusUpdate: { status: 'sold' }
              },
          });
          errorEmitter.emit('permission-error', permissionError);

          // Also show a user-friendly error message
          toast({
              variant: 'destructive',
              title: 'Payment Failed',
              description: 'There was an error processing your purchase. Please try again.',
          });
      })
      .finally(() => {
          setIsPaying(false);
          setSelectedPaymentMethod(null);
      });
  };
  
  const handleTriggerClick = (e: React.MouseEvent) => {
    if (ticket.status === 'sold' || buyer?.id === ticket.postedBy) {
        e.preventDefault();
        toast({
            variant: 'destructive',
            title: ticket.status === 'sold' ? 'Ticket Sold' : 'Cannot Buy Own Ticket',
            description: ticket.status === 'sold' ? 'This ticket is no longer available.' : 'You cannot purchase a ticket you have posted.',
        });
        return;
    }
  }


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
            You are about to purchase {ticket.ticketCount} ticket(s) for {ticket.movieName}.
            Choose a payment method to proceed. Total: ₹{(ticket.ticketPrice * ticket.ticketCount).toFixed(2)}
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
