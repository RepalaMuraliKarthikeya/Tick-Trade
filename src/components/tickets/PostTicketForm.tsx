"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const postTicketSchema = z.object({
  movieName: z.string().min(1, "Movie name is required"),
  theaterName: z.string().min(1, "Theater name is required"),
  location: z.string().min(1, "Location is required"),
  showDate: z.date({ required_error: "A show date is required." }),
  showTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use 24-hour format (e.g., 19:30)."),
  ticketCount: z.coerce.number().int().min(1, "At least one ticket is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  // In a real app, image handling would be more robust.
  imageUrl: z.any().optional(),
});

export function PostTicketForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof postTicketSchema>>({
    resolver: zodResolver(postTicketSchema),
    defaultValues: {
      movieName: "",
      theaterName: "",
      location: "",
      showTime: "20:00",
      ticketCount: 1,
      price: 20,
    },
  });

  function onSubmit(values: z.infer<typeof postTicketSchema>) {
    startTransition(async () => {
      // In a real app, this would call a server action to save data to Firestore and upload the image.
      console.log("Form submitted with values:", values);
      
      toast({
        title: "Ticket Posted!",
        description: "Your ticket has been successfully listed for sale.",
      });
      router.push('/');
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="movieName" render={({ field }) => (
            <FormItem>
              <FormLabel>Movie Name</FormLabel>
              <FormControl><Input placeholder="e.g., The Matrix" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="theaterName" render={({ field }) => (
            <FormItem>
              <FormLabel>Theater Name</FormLabel>
              <FormControl><Input placeholder="e.g., Cineplex Grand" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="location" render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl><Input placeholder="e.g., Toronto, ON" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="showDate" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Show Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="showTime" render={({ field }) => (
            <FormItem>
              <FormLabel>Show Time</FormLabel>
              <FormControl><Input type="time" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="ticketCount" render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Tickets</FormLabel>
              <FormControl><Input type="number" min="1" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Price (per ticket)</FormLabel>
              <FormControl><Input type="number" min="0" step="0.01" placeholder="$" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Ticket / Poster Image</FormLabel>
            <FormControl>
                <Input type="file" className="file:text-primary file:font-medium" />
            </FormControl>
            <FormDescription>Upload an image of the ticket or movie poster.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post Ticket
        </Button>
      </form>
    </Form>
  );
}
