"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type AuthGuardProps = Readonly<{
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}>;

export function AuthGuard({ children, allowedRoles, redirectTo = '/dashboard' }: AuthGuardProps) {
  const router = useRouter();
  const { loading, user } = useAuth();
  const isAllowed = !allowedRoles || (user ? allowedRoles.includes(user.role) : false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user && !isAllowed) {
      router.push(redirectTo);
    }
  }, [isAllowed, loading, redirectTo, router, user]);

  if (loading || !user || !isAllowed) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return <>{children}</>;
}
