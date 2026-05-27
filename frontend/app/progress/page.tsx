"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function ProgressPage() {
  const [progress, setProgress] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [weight, setWeight] = useState(70);
  const [bodyFat, setBodyFat] = useState(18);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [waist, setWaist] = useState(80);
  const [chest, setChest] = useState(95);

  const loadData = async () => {
    const response = await api.get('/progress');
    setProgress(response.data.progress);
    setMeasurements(response.data.measurements);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveProgress = async () => {
    await api.post('/progress', { date, weight, bodyFat, notes: 'Registro via dashboard' });
    await api.post('/progress/measurements', {
      date,
      weight,
      chest,
      waist,
      hips: 95,
      neck: 38,
      arm: 32,
      thigh: 56,
      notes: 'Medidas adicionadas'
    });
    loadData();
  };

  const chartData = [...progress].slice(0, 8).reverse().map((entry) => ({
    label: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    weight: Number(entry.weight)
  }));

  return (
    <AuthGuard>
      <AppShell>
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Registrar evolução</CardTitle>
            <CardDescription>Salve peso e medidas corporais para acompanhar o progresso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} placeholder="Peso" />
              <Input type="number" value={bodyFat} onChange={(e) => setBodyFat(Number(e.target.value))} placeholder="% gordura" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="number" value={waist} onChange={(e) => setWaist(Number(e.target.value))} placeholder="Cintura" />
              <Input type="number" value={chest} onChange={(e) => setChest(Number(e.target.value))} placeholder="Peitoral" />
            </div>
            <Button onClick={saveProgress} className="w-full">Salvar evolução</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de peso</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Últimas medições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {measurements.slice(0, 5).map((measurement) => (
                  <div key={measurement.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm">
                    <p>{new Date(measurement.date).toLocaleDateString('pt-BR')}</p>
                    <p>Cintura: {measurement.waist}cm • Peitoral: {measurement.chest}cm</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </AppShell>
    </AuthGuard>
  );
}
