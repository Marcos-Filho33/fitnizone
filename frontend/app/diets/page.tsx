"use client";

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function DietsPage() {
  const [diets, setDiets] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [selectedDietId, setSelectedDietId] = useState<string | null>(null);
  const [mealName, setMealName] = useState('');
  const [foodId, setFoodId] = useState('');
  const [grams, setGrams] = useState(100);
  const [timeOfDay, setTimeOfDay] = useState('CAFE');

  const loadData = async () => {
    const [dietsResponse, foodsResponse] = await Promise.all([api.get('/diets'), api.get('/foods')]);
    setDiets(dietsResponse.data);
    setFoods(foodsResponse.data);
    if (dietsResponse.data.length > 0 && !selectedDietId) {
      setSelectedDietId(dietsResponse.data[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentDiet = diets.find((diet) => diet.id === selectedDietId);

  const totals = useMemo(() => {
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

  const createDiet = async () => {
    const response = await api.post('/diets', { title, date, notes });
    setSelectedDietId(response.data.id);
    setTitle('');
    setNotes('');
    loadData();
  };

  const addMeal = async () => {
    if (!selectedDietId) return;
    await api.post(`/diets/${selectedDietId}/meals`, { name: mealName, foodId, grams: Number(grams), timeOfDay });
    setMealName('');
    setFoodId('');
    setGrams(100);
    loadData();
  };

  const deleteDiet = async (id: string) => {
    await api.delete(`/diets/${id}`);
    loadData();
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar dieta</CardTitle>
              <CardDescription>Planeje refeições e acompanhe macros diários.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label htmlFor="diet-title" className="mb-2 block text-sm">Título</label>
                <Input id="diet-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dieta de ganho" />
              </div>
              <div>
                <label htmlFor="diet-date" className="mb-2 block text-sm">Data</label>
                <Input id="diet-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label htmlFor="diet-notes" className="mb-2 block text-sm">Observações</label>
                <Input id="diet-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Objetivo do dia" />
              </div>
              <Button onClick={createDiet} className="w-full">Salvar dieta</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adicionar refeição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label htmlFor="meal-name" className="mb-2 block text-sm">Nome da refeição</label>
                <Input id="meal-name" value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="Nome da refeição" />
              </div>
              <div>
                <label htmlFor="foodId" className="mb-2 block text-sm">Alimento</label>
                <select id="foodId" value={foodId} onChange={(e) => setFoodId(e.target.value)} className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white">
                  <option value="">Selecione alimento</option>
                  {foods.map((food) => (
                    <option key={food.id} value={food.id}>{food.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="grams" className="mb-2 block text-sm">Gramas</label>
                  <Input id="grams" type="number" value={grams} onChange={(e) => setGrams(Number(e.target.value))} />
                </div>
                <div>
                  <label htmlFor="timeOfDay" className="mb-2 block text-sm">Horário</label>
                  <select id="timeOfDay" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-white">
                    <option value="CAFE">Café</option>
                    <option value="ALMOCO">Almoço</option>
                    <option value="JANTA">Janta</option>
                    <option value="LANCHE">Lanche</option>
                    <option value="PRE_TREINO">Pré-treino</option>
                    <option value="POS_TREINO">Pós-treino</option>
                  </select>
                </div>
              </div>
              <Button onClick={addMeal} className="w-full"><Plus size={16} />Adicionar refeição</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo diário</CardTitle>
              <CardDescription>Calorias e macros do plano atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-slate-950 p-3"><p className="text-sm text-slate-300">Calorias</p><p className="text-2xl font-bold">{totals.calories.toFixed(1)}</p></div>
                <div className="rounded-xl border border-white/10 bg-slate-950 p-3"><p className="text-sm text-slate-300">Proteína</p><p className="text-2xl font-bold">{totals.protein.toFixed(1)}g</p></div>
                <div className="rounded-xl border border-white/10 bg-slate-950 p-3"><p className="text-sm text-slate-300">Carboidratos</p><p className="text-2xl font-bold">{totals.carbs.toFixed(1)}g</p></div>
                <div className="rounded-xl border border-white/10 bg-slate-950 p-3"><p className="text-sm text-slate-300">Gordura</p><p className="text-2xl font-bold">{totals.fat.toFixed(1)}g</p></div>
              </div>
            </CardContent>
          </Card>

          {diets.map((diet) => (
            <Card key={diet.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{diet.title}</CardTitle>
                    <CardDescription>{new Date(diet.date).toLocaleDateString('pt-BR')}</CardDescription>
                  </div>
                  <Button variant="secondary" onClick={() => setSelectedDietId(diet.id)}>Selecionar</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(diet.meals || []).map((meal: any) => (
                    <div key={meal.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm">
                      <p className="font-semibold">{meal.name}</p>
                      <p>{meal.food.name} • {meal.grams}g • {meal.calories} kcal</p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => deleteDiet(diet.id)} className="mt-4"><Trash2 size={16} />Excluir</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </AppShell>
    </AuthGuard>
  );
}
