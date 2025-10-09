"use client"

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export function SearchBar({ onSearch }: SearchBarProps) {
  const debounced = useDebouncedCallback(
    (value) => {
      onSearch(value);
    },
    300
  );

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search movie, theater, location..."
        className="pl-11"
        onChange={(e) => debounced(e.target.value)}
      />
    </div>
  );
}
