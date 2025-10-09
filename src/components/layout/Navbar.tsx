"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Ticket, User, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/post-ticket', label: 'Post Ticket', icon: Ticket },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged out successfully' });
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ variant: 'destructive', title: 'Logout failed', description: 'Could not log you out. Please try again.' });
    }
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === link.href ? "text-primary font-semibold" : ""
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {isUserLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : user ? (
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="default" className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg">
          <div className="container pb-6 pt-2">
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary font-semibold" : ""
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="border-t border-border/40 pt-6 flex items-center gap-4">
                {isUserLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : user ? (
                  <Button variant="ghost" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
