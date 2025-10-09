import type { Ticket, User } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketCard } from '../tickets/TicketCard';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Film, Ticket as TicketIcon } from 'lucide-react';
import { TicketList } from '../tickets/TicketList';

type UserProfileProps = {
  user: User;
  postedTickets: Ticket[];
  purchasedTickets: Ticket[];
  isLoading: boolean;
};

export function UserProfile({ user, postedTickets, purchasedTickets, isLoading }: UserProfileProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} alt={user.name ?? ''} />
          <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-headline font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-4 flex flex-wrap gap-6">
            <StatItem icon={Film} value={postedTickets.length} label="Tickets Posted" />
            <StatItem icon={TicketIcon} value={purchasedTickets.length} label="Tickets Purchased" />
          </div>
        </div>
      </header>

      <Tabs defaultValue="posted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posted">Tickets Posted</TabsTrigger>
          <TabsTrigger value="purchased">Tickets Purchased</TabsTrigger>
        </TabsList>
        <TabsContent value="posted" className="mt-6">
          <TicketHistoryList tickets={postedTickets} isLoading={isLoading} emptyMessage="You haven't posted any tickets yet." />
        </TabsContent>
        <TabsContent value="purchased" className="mt-6">
          <TicketHistoryList tickets={purchasedTickets} isLoading={isLoading} emptyMessage="You haven't purchased any tickets yet. Browse available tickets to get started!" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TicketHistoryList({ tickets, emptyMessage, isLoading }: { tickets: Ticket[], emptyMessage: string, isLoading: boolean }) {
  if (isLoading) {
    return <TicketList tickets={null} isLoading={true} />;
  }
  
  if (tickets.length === 0) {
    return (
      <Card className="text-center py-20 bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle>Nothing here...</CardTitle>
          <CardDescription>{emptyMessage}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
    </div>
  );
}

function StatItem({ icon: Icon, value, label }: { icon: React.ElementType, value: number, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-6 w-6 text-primary" />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
