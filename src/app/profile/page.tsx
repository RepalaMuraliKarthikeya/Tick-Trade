import { UserProfile } from '@/components/profile/UserProfile';
import { mockTickets, mockUsers } from '@/lib/mock-data';

export default function ProfilePage() {
  // In a real app, you'd get the logged-in user's ID from a session.
  // We'll use the first mock user as the "logged in" user for this demo.
  const currentUser = mockUsers[0];
  const postedTickets = mockTickets.filter(t => t.postedBy === currentUser.id);
  
  // For this mock, we'll find tickets that are sold and were posted by other users,
  // then assign the first one to our current user as a "purchased" ticket.
  const purchasedTickets = mockTickets.filter(t => t.status === 'sold' && t.postedBy !== currentUser.id).slice(0, 1);

  return (
    <div className="container mx-auto py-12">
      <UserProfile
        user={currentUser}
        postedTickets={postedTickets}
        purchasedTickets={purchasedTickets}
      />
    </div>
  );
}
