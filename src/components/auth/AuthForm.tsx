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
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import { logUserActivity } from '@/lib/activity-logger';

const formSchema = z.object({
  name: z.string().optional(),
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
  const auth = useAuth();
  const { firestore } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      return;
    }

    startTransition(async () => {
      try {
        let userCredential;
        if (mode === 'login') {
          userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
          const user = userCredential.user;
          // Ensure user profile is created/updated on login as well
          const userRef = doc(firestore, 'users', user.uid);
          await setDoc(userRef, {
            id: user.uid,
            name: user.displayName,
            email: user.email,
          }, { merge: true });

        } else { // signup mode
          userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
          const user = userCredential.user;
          const nameToSet = values.name || values.email.split('@')[0];
          await updateProfile(user, { displayName: nameToSet });
          
          const userRef = doc(firestore, 'users', user.uid);
          await setDoc(userRef, {
            id: user.uid,
            name: nameToSet,
            email: user.email,
          }, { merge: true });
        }
        
        const user = userCredential.user;
        await logUserActivity(firestore, user.uid, 'login');

        toast({
          title: mode === 'login' ? "Login Successful" : "Signup Successful",
          description: "Welcome to MovieRush! Redirecting...",
        });
        router.push('/profile');
      } catch (error) {
        let errorMessage = "An unexpected error occurred.";
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already in use.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak.';
                    break;
                default:
                    errorMessage = error.message;
                    break;
            }
        }
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: errorMessage,
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
            : "Enter your details to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {mode === 'signup' && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
