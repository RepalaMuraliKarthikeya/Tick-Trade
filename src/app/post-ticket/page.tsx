import { PostTicketForm } from '@/components/tickets/PostTicketForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PostTicketPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Post Your Tickets</CardTitle>
          <CardDescription>
            Fill out the form below to list your extra movie tickets on MovieRush.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostTicketForm />
        </CardContent>
      </Card>
    </div>
  );
}
