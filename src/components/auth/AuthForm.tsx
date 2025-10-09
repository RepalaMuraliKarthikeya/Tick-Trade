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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login, signup } from '@/lib/actions';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const action = mode === 'login' ? login : signup;
      const result = await action(values);
      if (result.success) {
        toast({
          title: mode === 'login' ? "Login Successful" : "Signup Successful",
          description: "Welcome to MovieRush! Redirecting...",
        });
        router.push('/profile');
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: result.error,
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm bg-card/50 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? "Enter your credentials to access your account."
            : "Enter your email and password to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline text-primary hover:text-primary/80">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="underline text-primary hover:text-primary/80">
                Login
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
