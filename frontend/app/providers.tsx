"use client";

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ className: 'bg-slate-900 text-white border border-slate-700' }} />
      {children}
    </AuthProvider>
  );
}
