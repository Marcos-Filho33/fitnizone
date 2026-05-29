"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Flame, Salad, Scale3D } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [diets, setDiets] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [workoutsResponse, dietsResponse, progressResponse] = await Promise.allSettled([
        api.get('/workouts'),
        api.get('/diets'),
        api.get('/progress')
      ]);

      if (workoutsResponse.status === 'fulfilled') {
        setWorkouts(workoutsResponse.value.data);
      }
      if (dietsResponse.status === 'fulfilled') {
        setDiets(dietsResponse.value.data);
      }
      if (progressResponse.status === 'fulfilled') {
        setProgress(progressResponse.value.data.progress);
        setMeasurements(progressResponse.value.data.measurements);
      }
      setLoading(false);
    }

    load();
  }, []);

  const currentDiet = diets[0];
  const currentWorkout = workouts[0];
  const dailyMacros = useMemo(() => {
    return (currentDiet?.meals || []).reduce(
      (acc: any, meal: any) => {
        acc.calories += Number(meal.calories || 0);
        acc.protein += Number(meal.protein || 0);
        acc.carbs += Number(meal.carbs || 0);
        acc.fat += Number(meal.fat || 0);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [currentDiet]);

  const latestWeight = progress[0]?.weight || measurements[0]?.weight || 0;
  const chartData = [...progress].slice(0, 6).reverse().map((entry) => ({
    label: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    weight: Number(entry.weight)
  }));

  const measurementData = [...measurements].slice(0, 6).reverse().map((entry) => ({
    label: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    waist: Number(entry.waist || 0)
  }));

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-rose-300">Dashboard interativo</p>
            <h1 className="text-3xl font-bold">Visão geral do seu progresso</h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Acompanhe treinos, macros, evolução corporal e ações recomendadas em tempo real.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/workouts"><Button variant="outline">Criar treino</Button></Link>
            <Link href="/diets"><Button>Planejar dieta</Button></Link>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-3xl bg-slate-900" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader><CardTitle>Calorias diárias</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Flame className="text-rose-300" />
                  <div>
                    <p className="text-3xl font-bold">{dailyMacros.calories || 0}</p>
                    <CardDescription>Calorias estimadas</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Proteínas</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Scale3D className="text-sky-300" />
                  <div>
                    <p className="text-3xl font-bold">{dailyMacros.protein.toFixed(1) || 0}</p>
                    <CardDescription>g consumidos</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Carboidratos</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Salad className="text-emerald-300" />
                  <div>
                    <p className="text-3xl font-bold">{dailyMacros.carbs.toFixed(1) || 0}</p>
                    <CardDescription>g consumidos</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Peso corporal</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-amber-300" />
                  <div>
                    <p className="text-3xl font-bold">{latestWeight || 0} kg</p>
                    <CardDescription>Última medição</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de peso</CardTitle>
              <CardDescription>Gráfico interativo com o histórico recente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#f43f5e" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Treino do dia</CardTitle>
                <CardDescription>{currentWorkout?.title || 'Cadastre um treino para começar'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{currentWorkout?.goal || 'Defina metas e organizing seus treinos.'}</p>
                <Link href="/workouts"><Button className="mt-4">Ver treinos</Button></Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Dieta do dia</CardTitle>
                <CardDescription>{currentDiet?.title || 'Crie uma dieta personalizada'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{currentDiet?.meals?.length || 0} refeições planejadas</p>
                <Link href="/diets"><Button className="mt-4">Gerenciar dieta</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de macros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Proteína', value: dailyMacros.protein },
                    { name: 'Carb', value: dailyMacros.carbs },
                    { name: 'Gordura', value: dailyMacros.fat }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f43f5e" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medidas corporais</CardTitle>
              <CardDescription>Histórico de cintura e medidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip />
                    <Line type="monotone" dataKey="waist" stroke="#38bdf8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </AppShell>
    </AuthGuard>
  );
}
