"use client";

import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

const createExercise = () => ({
  id: globalThis.crypto.randomUUID(),
  exerciseId: '',
  sets: 3,
  reps: '10',
  restSeconds: 60,
  notes: ''
});

const muscleOptions = [
  { value: 'ALL', label: 'Todos os grupos' },
  { value: 'PEITO', label: 'Peito' },
  { value: 'COSTAS', label: 'Costas' },
  { value: 'PERNAS', label: 'Pernas' },
  { value: 'OMBROS', label: 'Ombros' },
  { value: 'BICEPS', label: 'Bíceps' },
  { value: 'TRICEPS', label: 'Tríceps' },
  { value: 'ABDOMEN', label: 'Abdômen' }
];

const difficultyLabels: Record<string, string> = {
  INICIANTE: 'Iniciante',
  INTERMEDIARIO: 'Intermediário',
  AVANCADO: 'Avançado'
};

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('INTERMEDIARIO');
  const [category, setCategory] = useState('Força');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([createExercise()]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('ALL');
  const [exerciseDifficultyFilter, setExerciseDifficultyFilter] = useState('ALL');

  const loadWorkouts = async () => {
    const workoutsResponse = await api.get('/workouts');
    setWorkouts(workoutsResponse.data);
  };

  const loadExercises = async () => {
    const params = new URLSearchParams();
    if (exerciseQuery) {
      params.set('query', exerciseQuery);
    }
    if (muscleFilter !== 'ALL') {
      params.set('muscleGroup', muscleFilter);
    }
    if (exerciseDifficultyFilter !== 'ALL') {
      params.set('difficulty', exerciseDifficultyFilter);
    }

    const response = await api.get(params.size > 0 ? `/exercises?${params.toString()}` : '/exercises');
    setExercises(response.data);
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    loadExercises();
  }, [exerciseDifficultyFilter, exerciseQuery, muscleFilter]);

  const addExercise = () => setSelectedExercises((current) => [...current, createExercise()]);

  const updateExercise = (index: number, field: string, value: string | number) => {
    setSelectedExercises((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeExercise = (index: number) => {
    setSelectedExercises((current) => current.filter((_, i) => i !== index));
  };

  const payload = useMemo(() => ({
    title,
    goal,
    duration,
    difficulty,
    category,
    exercises: selectedExercises.map((item) => ({
      exerciseId: item.exerciseId,
      sets: Number(item.sets),
      reps: item.reps,
      restSeconds: Number(item.restSeconds),
      notes: item.notes
    }))
  }), [title, goal, duration, difficulty, category, selectedExercises]);

  const selectedExerciseCount = selectedExercises.filter((item) => item.exerciseId).length;
  const canSubmit = title.trim().length >= 3 && selectedExercises.length > 0 && selectedExercises.every((item) => item.exerciseId);

  const submit = async () => {
    if (!canSubmit) return;

    if (editingId) {
      await api.put(`/workouts/${editingId}`, payload);
      setEditingId(null);
    } else {
      await api.post('/workouts', payload);
    }

    setTitle('');
    setGoal('');
    setDuration(45);
    setCategory('Força');
    setDifficulty('INTERMEDIARIO');
    setSelectedExercises([createExercise()]);
    loadWorkouts();
  };

  const handleEdit = (workout: any) => {
    setEditingId(workout.id);
    setTitle(workout.title);
    setGoal(workout.goal);
    setDuration(workout.duration);
    setDifficulty(workout.difficulty);
    setCategory(workout.category);
    setSelectedExercises(
      workout.workoutExercises.map((wk: any) => ({
        id: globalThis.crypto.randomUUID(),
        exerciseId: wk.exerciseId,
        sets: wk.sets,
        reps: wk.reps,
        restSeconds: wk.restSeconds,
        notes: wk.notes || ''
      }))
    );
    setExerciseQuery('');
    setMuscleFilter('ALL');
    setExerciseDifficultyFilter('ALL');
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/workouts/${id}`);
    loadWorkouts();
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{workouts.length}</CardTitle>
                <CardDescription>treinos salvos</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{exercises.length}</CardTitle>
                <CardDescription>exercícios no filtro atual</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{selectedExerciseCount}</CardTitle>
                <CardDescription>exercícios selecionados no treino</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar treino' : 'Criar treino'}</CardTitle>
            <CardDescription>Monte sessões completas com séries, repetições, descanso e observações.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm">Título</label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Treino A" />
            </div>
            <div>
              <label htmlFor="goal" className="mb-2 block text-sm">Meta</label>
              <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Hipertrofia" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="duration" className="mb-2 block text-sm">Duração (min)</label>
                <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </div>
              <div>
                <label htmlFor="difficulty" className="mb-2 block text-sm">Dificuldade</label>
                <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white">
                  <option value="INICIANTE">Iniciante</option>
                  <option value="INTERMEDIARIO">Intermediário</option>
                  <option value="AVANCADO">Avançado</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="category" className="mb-2 block text-sm">Categoria</label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Exercícios</p>
                <Button type="button" variant="outline" onClick={addExercise}><Plus size={16} />Adicionar</Button>
              </div>
              {selectedExercises.map((exercise, index) => {
                const exerciseSelectId = `exercise-${exercise.id}`;
                const setsId = `sets-${exercise.id}`;
                const repsId = `reps-${exercise.id}`;
                const restId = `rest-${exercise.id}`;
                const notesId = `notes-${exercise.id}`;

                return (
                  <div key={exercise.id} className="rounded-2xl border border-white/10 bg-slate-950 p-3">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={exerciseSelectId} className="mb-2 block text-sm">Exercício</label>
                        <select
                          id={exerciseSelectId}
                          value={exercise.exerciseId}
                          onChange={(e) => updateExercise(index, 'exerciseId', e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white"
                        >
                          <option value="">Selecione</option>
                          {exercises.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor={setsId} className="mb-2 block text-sm">Séries</label>
                          <Input id={setsId} type="number" value={exercise.sets} onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))} />
                        </div>
                        <div>
                          <label htmlFor={repsId} className="mb-2 block text-sm">Repetições</label>
                          <Input id={repsId} value={exercise.reps} onChange={(e) => updateExercise(index, 'reps', e.target.value)} placeholder="10" />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor={restId} className="mb-2 block text-sm">Descanso (s)</label>
                          <Input id={restId} type="number" value={exercise.restSeconds} onChange={(e) => updateExercise(index, 'restSeconds', Number(e.target.value))} placeholder="60" />
                        </div>
                        <div>
                          <label htmlFor={notesId} className="mb-2 block text-sm">Observações</label>
                          <Input id={notesId} value={exercise.notes} onChange={(e) => updateExercise(index, 'notes', e.target.value)} placeholder="Observações" />
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => removeExercise(index)} className="mt-3">Remover</Button>
                  </div>
                );
              })}
            </div>

            <Button className="w-full" onClick={submit} disabled={!canSubmit}>{editingId ? 'Salvar alterações' : 'Salvar treino'}</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de exercícios</CardTitle>
              <CardDescription>Pesquise por nome, grupo muscular e dificuldade antes de montar o treino.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Input value={exerciseQuery} onChange={(e) => setExerciseQuery(e.target.value)} placeholder="Buscar exercício" />
                <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-white">
                  {muscleOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select value={exerciseDifficultyFilter} onChange={(e) => setExerciseDifficultyFilter(e.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-white">
                  <option value="ALL">Todas as dificuldades</option>
                  <option value="INICIANTE">Iniciante</option>
                  <option value="INTERMEDIARIO">Intermediário</option>
                  <option value="AVANCADO">Avançado</option>
                </select>
              </div>
              <div className="max-h-[420px] space-y-3 overflow-y-auto">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{exercise.name}</p>
                      <span className="rounded-full bg-rose-500/10 px-2 py-1 text-xs text-rose-200">{exercise.muscleGroup}</span>
                      <span className="rounded-full bg-sky-500/10 px-2 py-1 text-xs text-sky-200">{difficultyLabels[exercise.difficulty] || exercise.difficulty}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{exercise.description}</p>
                    {exercise.instructions && <p className="mt-2 text-sm text-slate-400">{exercise.instructions}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{workout.title}</CardTitle>
                    <CardDescription>{workout.goal}</CardDescription>
                  </div>
                  <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-200">{workout.difficulty}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{workout.duration} min • {workout.category}</p>
                <div className="mt-3 space-y-2">
                  {workout.workoutExercises.map((item: any) => (
                    <div key={item.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
                      <p className="font-semibold">{item.exercise.name}</p>
                      <p>{item.sets} séries • {item.reps} reps • {item.restSeconds}s descanso</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(workout)}><Edit size={16} />Editar</Button>
                  <Button variant="secondary" onClick={() => handleDelete(workout.id)}><Trash2 size={16} />Excluir</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
