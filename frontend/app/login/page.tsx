"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

type FormValues = z.infer<typeof schema>;
const defaultAdminCredentials = {
  email: 'admin@fitzone.com.br',
  password: 'Admin@123'
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: defaultAdminCredentials.email,
      password: defaultAdminCredentials.password
    }
  });
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const canSubmit = schema.safeParse({
    email: emailValue ?? '',
    password: passwordValue ?? ''
  }).success;

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location?.search ?? '');
    if (params.get('reason') === 'session-expired') {
      setSessionExpiredMessage('Sua sessão expirou. Faça login novamente para continuar.');
      sessionStorage.removeItem('auth-expired-message');
      return;
    }

    const storedMessage = sessionStorage.getItem('auth-expired-message');
    if (storedMessage) {
      setSessionExpiredMessage(storedMessage);
      sessionStorage.removeItem('auth-expired-message');
    }
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Erro ao fazer login';
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.2),_transparent_16%),linear-gradient(135deg,#020617,#0f172a)] p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Entrar no FITZONE</CardTitle>
          <CardDescription>Gerencie treino, dieta e evolução em uma única plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionExpiredMessage && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <p>{sessionExpiredMessage}</p>
              <p className="mt-1 text-amber-50/90">Digite suas credenciais e continue sua jornada.</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">E-mail</label>
              <Input
                id="email"
                type="email"
                autoFocus
                autoComplete="email"
                placeholder="voce@empresa.com"
                {...register('email')}
              />
              {errors.email && <p className="mt-2 text-sm text-rose-300">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">Senha</label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                {...register('password')}
              />
              {errors.password && <p className="mt-2 text-sm text-rose-300">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-50">
              <p className="font-medium">Acesso de administrador já disponível</p>
              <p className="mt-1">
                <span className="text-emerald-200">{defaultAdminCredentials.email}</span> / <span className="text-emerald-200">{defaultAdminCredentials.password}</span>
              </p>
              <p className="mt-2 text-emerald-100/90">Use esse acesso para gerenciar usuários, alimentos e treinos. Depois, troque a senha pelo fluxo da sua equipe.</p>
            </div>
            <p className="text-sm text-slate-300">
              Ainda não tem conta? <Link href="/register" className="text-rose-300">Cadastre-se</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
