import { Film } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="MovieRush Home">
      <Film className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold font-headline text-white">
        MovieRush
      </span>
    </Link>
  );
}
