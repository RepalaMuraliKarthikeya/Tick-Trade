import { TicketDetails } from '@/components/tickets/TicketDetails';
import { mockTickets, mockUsers } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  const ticket = mockTickets.find(t => t.id === params.id);
  if (!ticket) {
    notFound();
  }

  const seller = mockUsers.find(u => u.id === ticket.postedBy);

  return (
    <div className="container mx-auto py-12">
      <TicketDetails ticket={ticket} sellerName={seller?.name ?? 'Anonymous'} />
    </div>
  );
}
