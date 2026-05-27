"use client";

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');

  const load = async () => {
    const [usersResponse, foodsResponse, exercisesResponse] = await Promise.all([api.get('/users'), api.get('/foods'), api.get('/exercises')]);
    setUsers(usersResponse.data);
    setFoods(foodsResponse.data);
    setExercises(exercisesResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id: string, role: string) => {
    await api.patch(`/users/${id}`, { role });
    load();
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
    load();
  };

  const createUser = async () => {
    await api.post('/users', { name, email, password, role });
    setName('');
    setEmail('');
    setPassword('');
    setRole('STUDENT');
    load();
  };

  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <AppShell>
        <div className="space-y-8">
          <div>
            <p className="text-sm text-rose-300">Área administrativa</p>
            <h1 className="text-3xl font-bold">Gerenciar usuários e conteúdo</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{users.length}</CardTitle>
                <CardDescription>usuários cadastrados</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{foods.length}</CardTitle>
                <CardDescription>alimentos na base</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{exercises.length}</CardTitle>
                <CardDescription>exercícios disponíveis</CardDescription>
              </CardHeader>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Criar usuário</CardTitle>
              <CardDescription>Cadastre alunos, trainers e novos administradores sem trocar sua sessão.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4">
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-white">
                <option value="STUDENT">Aluno</option>
                <option value="TRAINER">Trainer</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button onClick={createUser} className="sm:col-span-4">Criar usuário</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Acesso administrativo padrão</CardTitle>
              <CardDescription>Disponível automaticamente no bootstrap do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-200">
              <p>E-mail: <span className="font-medium text-emerald-300">admin@fitzone.com.br</span></p>
              <p>Senha: <span className="font-medium text-emerald-300">Admin@123</span></p>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usuários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-slate-300">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          aria-label={`Função de ${user.name}`}
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          className="rounded-xl border border-slate-700 bg-slate-900 px-2 text-sm"
                        >
                          <option value="STUDENT">Aluno</option>
                          <option value="TRAINER">Trainer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <Button variant="secondary" onClick={() => deleteUser(user.id)}>Remover</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alimentos cadastrados</CardTitle>
                <CardDescription>{foods.length} itens disponíveis.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {foods.map((food) => (
                    <div key={food.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm">
                      <p className="font-semibold">{food.name}</p>
                      <p>{food.caloriesPer100g} kcal · {food.proteinPer100g}g proteína</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Biblioteca de exercícios</CardTitle>
                <CardDescription>{exercises.length} exercícios prontos para montar treinos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm">
                      <p className="font-semibold">{exercise.name}</p>
                      <p>{exercise.muscleGroup} · {exercise.difficulty}</p>
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
