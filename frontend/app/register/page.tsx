"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    await registerUser(values.name, values.email, values.password);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.2),_transparent_16%),linear-gradient(135deg,#020617,#0f172a)] p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Criar conta FITZONE</CardTitle>
          <CardDescription>Seu plano de treino e nutrição na medida certa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">Nome</label>
              <Input id="name" placeholder="Seu nome" {...register('name')} />
              {errors.name && <p className="mt-2 text-sm text-rose-300">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">E-mail</label>
              <Input id="email" placeholder="voce@empresa.com" {...register('email')} />
              {errors.email && <p className="mt-2 text-sm text-rose-300">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">Senha</label>
              <Input id="password" type="password" placeholder="********" {...register('password')} />
              {errors.password && <p className="mt-2 text-sm text-rose-300">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <p className="text-sm text-slate-300">
              Já possui conta? <Link href="/login" className="text-rose-300">Entrar</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
