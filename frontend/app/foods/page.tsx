"use client";

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

export default function FoodsPage() {
  const { user } = useAuth();
  const [foods, setFoods] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [weight, setWeight] = useState(100);
  const [newFood, setNewFood] = useState({ name: '', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, category: '', source: 'Cadastro manual' });

  const loadFoods = async () => {
    const params = new URLSearchParams();
    if (query) {
      params.set('query', query);
    }
    if (categoryFilter !== 'ALL') {
      params.set('category', categoryFilter);
    }

    const requestUrl = params.size > 0 ? `/foods?${params.toString()}` : '/foods';
    const response = await api.get(requestUrl);
    setFoods(response.data);
  };

  useEffect(() => {
    loadFoods();
  }, [categoryFilter, query]);

  useEffect(() => {
    if (selectedFoodId && foods.some((food) => food.id === selectedFoodId)) {
      return;
    }

    setSelectedFoodId(foods[0]?.id || '');
  }, [foods, selectedFoodId]);

  const selectedFood = foods.find((food) => food.id === selectedFoodId) || null;
  const categories = useMemo(() => Array.from(new Set(foods.map((food) => food.category).filter(Boolean))).sort(), [foods]);

  const calculated = useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const factor = weight / 100;
    return {
      calories: Number((selectedFood.caloriesPer100g * factor).toFixed(1)),
      protein: Number((selectedFood.proteinPer100g * factor).toFixed(1)),
      carbs: Number((selectedFood.carbsPer100g * factor).toFixed(1)),
      fat: Number((selectedFood.fatPer100g * factor).toFixed(1))
    };
  }, [selectedFood, weight]);

  const topProteinFoods = useMemo(
    () => [...foods].sort((a, b) => b.proteinPer100g - a.proteinPer100g).slice(0, 3),
    [foods]
  );

  const saveFood = async () => {
    await api.post('/foods', newFood);
    setNewFood({ name: '', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, category: '', source: 'Cadastro manual' });
    loadFoods();
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{foods.length}</CardTitle>
                <CardDescription>alimentos filtrados na base</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{categories.length}</CardTitle>
                <CardDescription>categorias visíveis</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{topProteinFoods[0]?.name || 'Sem dados'}</CardTitle>
                <CardDescription>maior proteína por 100g nesta busca</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calculadora nutricional</CardTitle>
            <CardDescription>Escolha um alimento e calcule calorias e macros pelo peso desejado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="query" className="mb-2 block text-sm">Buscar alimento</label>
                <Input id="query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar alimento" />
              </div>
              <div>
                <label htmlFor="categoryFilter" className="mb-2 block text-sm">Categoria</label>
                <select id="categoryFilter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white">
                  <option value="ALL">Todas</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="selectedFoodId" className="mb-2 block text-sm">Alimento</label>
              <select id="selectedFoodId" value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)} className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white">
                <option value="">Selecione um alimento</option>
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>{food.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="weight" className="mb-2 block text-sm">Peso em gramas</label>
              <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} placeholder="Peso em gramas" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950 p-3"><p className="text-sm text-slate-300">Proteína</p><p className="text-xl font-bold">{calculated.protein}g</p></div>
              <div className="rounded-xl border border-white/10 bg-slate-950 p-3"><p className="text-sm text-slate-300">Carboidratos</p><p className="text-xl font-bold">{calculated.carbs}g</p></div>
              <div className="rounded-xl border border-white/10 bg-slate-950 p-3"><p className="text-sm text-slate-300">Gordura</p><p className="text-xl font-bold">{calculated.fat}g</p></div>
              <div className="rounded-xl border border-white/10 bg-slate-950 p-3"><p className="text-sm text-slate-300">Calorias</p><p className="text-xl font-bold">{calculated.calories} kcal</p></div>
            </div>
            {selectedFood && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-50">
                <p className="font-semibold">{selectedFood.name}</p>
                <p className="mt-1">{selectedFood.category || 'Sem categoria'} · valores por 100g</p>
                <p className="mt-2 text-emerald-100/90">{selectedFood.source || 'Fonte não informada'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de alimentos</CardTitle>
              <CardDescription>Base com categorias, macros e origem nutricional de referência.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {foods.map((food) => (
                  <div key={food.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{food.name}</p>
                        <p className="text-slate-300">{food.category || 'Sem categoria'}</p>
                      </div>
                      <p className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">{food.caloriesPer100g} kcal</p>
                    </div>
                    <p className="mt-2">P {food.proteinPer100g}g · C {food.carbsPer100g}g · G {food.fatPer100g}g</p>
                    <p className="mt-1 text-slate-400">{food.source || 'Fonte não informada'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destaques por proteína</CardTitle>
              <CardDescription>Boa referência para montar refeições com mais saciedade e recuperação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topProteinFoods.map((food) => (
                <div key={food.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm">
                  <p className="font-semibold">{food.name}</p>
                  <p>{food.proteinPer100g}g proteína · {food.caloriesPer100g} kcal / 100g</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {(user?.role === 'ADMIN' || user?.role === 'TRAINER') && (
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar alimentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Nome" value={newFood.name} onChange={(e) => setNewFood({ ...newFood, name: e.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="number" placeholder="Kcal/100g" value={newFood.caloriesPer100g} onChange={(e) => setNewFood({ ...newFood, caloriesPer100g: Number(e.target.value) })} />
                  <Input type="number" placeholder="Proteína" value={newFood.proteinPer100g} onChange={(e) => setNewFood({ ...newFood, proteinPer100g: Number(e.target.value) })} />
                  <Input type="number" placeholder="Carboidratos" value={newFood.carbsPer100g} onChange={(e) => setNewFood({ ...newFood, carbsPer100g: Number(e.target.value) })} />
                  <Input type="number" placeholder="Gordura" value={newFood.fatPer100g} onChange={(e) => setNewFood({ ...newFood, fatPer100g: Number(e.target.value) })} />
                </div>
                <Input placeholder="Categoria" value={newFood.category} onChange={(e) => setNewFood({ ...newFood, category: e.target.value })} />
                <Input placeholder="Fonte" value={newFood.source} onChange={(e) => setNewFood({ ...newFood, source: e.target.value })} />
                <Button className="w-full" onClick={saveFood}>Salvar alimento</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
