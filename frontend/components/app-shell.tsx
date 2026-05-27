"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Dumbbell, Home, Salad, LineChart, Shield, User, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/workouts', label: 'Treinos', icon: Dumbbell },
  { href: '/exercises', label: 'Exercícios', icon: BookOpen },
  { href: '/diets', label: 'Dietas', icon: Salad },
  { href: '/foods', label: 'Alimentos', icon: LineChart },
  { href: '/progress', label: 'Progresso', icon: LineChart }
];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-rose-300">FITZONE SYSTEM</p>
            <p className="text-xs text-slate-400">Plataforma fitness premium</p>
          </div>

          <nav className="flex max-w-[55vw] gap-2 overflow-x-auto pb-1 md:max-w-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                    active ? 'bg-rose-500 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${pathname === '/admin' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:bg-slate-900'}`}>
                <Shield size={16} />
                Admin
              </Link>
            )}
            {user?.role === 'TRAINER' && (
              <Link href="/trainer" className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${pathname === '/trainer' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:bg-slate-900'}`}>
                <Users size={16} />
                Trainer
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/profile" className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-100">
              <User size={16} />
            </Link>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
