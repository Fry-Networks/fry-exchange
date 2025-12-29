'use client';

import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/login" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <Link href="/">
            <Logo size="md" />
          </Link>
          <div className="w-24" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          {!isSubmitted ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>
                  Enter your email and we&apos;ll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    prefix={<Mail className="h-4 w-4" />}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    error={error}
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    variant="fry"
                    className="w-full"
                    loading={isLoading}
                  >
                    Send Reset Link
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-fry-red-500 hover:text-fry-red-600"
                  >
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-buy/10">
                  <CheckCircle2 className="h-8 w-8 text-buy" />
                </div>
                <CardTitle className="text-2xl">Check Your Email</CardTitle>
                <CardDescription>
                  We&apos;ve sent a password reset link to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  <p>Didn&apos;t receive the email? Check your spam folder or try again with a different email address.</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try Another Email
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    href="/login"
                    className="font-medium text-fry-red-500 hover:text-fry-red-600"
                  >
                    Back to Sign In
                  </Link>
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
