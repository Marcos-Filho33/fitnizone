"use client";

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    async function load() {
      const response = await api.get('/auth/me');
      setName(response.data.name || '');
      setGoal(response.data.goal || '');
      setBio(response.data.bio || '');
    }

    load();
  }, []);

  const save = async () => {
    await api.patch('/auth/profile', { name, goal, bio });
  };

  return (
    <AuthGuard>
      <AppShell>
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Perfil do usuário</CardTitle>
            <CardDescription>Atualize seus dados e objetivos principais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-sm">Nome</label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="profile-goal" className="mb-2 block text-sm">Objetivo</label>
              <Input id="profile-goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ganhar massa, perder calorias" />
            </div>
            <div>
              <label htmlFor="profile-bio" className="mb-2 block text-sm">Bio</label>
              <Input id="profile-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Compartilhe sua rotina" />
            </div>
            <Button onClick={save} className="w-full">Salvar perfil</Button>
          </CardContent>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
