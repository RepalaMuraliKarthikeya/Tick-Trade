"use client";

import { Skeleton } from '@/components/ui/skeleton';

export function TicketDetailsSkeleton() {
  return (
    <div className="container mx-auto py-12">
      <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>
        <div className="md:col-span-3 space-y-6">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-12 w-3/4 rounded-md" />
          <Skeleton className="h-7 w-1/2 rounded-md" />
          <div className="my-8 border-t border-border/50 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
