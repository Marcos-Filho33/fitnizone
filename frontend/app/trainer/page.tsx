"use client";

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function TrainerPage() {
  const [relationships, setRelationships] = useState<any[]>([]);
  const [trainerId, setTrainerId] = useState('');
  const [studentId, setStudentId] = useState('');

  const load = async () => {
    const relationshipsResponse = await api.get('/users/relationships');
    setRelationships(relationshipsResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const assign = async () => {
    await api.post('/users/relationships', { trainerId, studentId });
    load();
  };

  return (
    <AuthGuard allowedRoles={['ADMIN', 'TRAINER']}>
      <AppShell>
        <div className="space-y-8">
          <div>
            <p className="text-sm text-rose-300">Área do Personal Trainer</p>
            <h1 className="text-3xl font-bold">Acompanhe alunos e recomendações</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vincular aluno</CardTitle>
              <CardDescription>Associe o profissional à rotina do aluno.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Input placeholder="Trainer ID" value={trainerId} onChange={(e) => setTrainerId(e.target.value)} />
              <Input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              <Button onClick={assign}>Associar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alunos conectados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relationships.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2">
                    <p className="font-semibold">{item.student.name}</p>
                    <p className="text-sm text-slate-300">Trainer: {item.trainer.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
