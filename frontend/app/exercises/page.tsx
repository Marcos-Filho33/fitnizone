"use client";

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Lightbulb, ListOrdered, PlayCircle, Search } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

type ExerciseLibraryItem = {
  sourceId: string;
  sourceUrl: string;
  name: string;
  bodyPart: string;
  primaryMuscle: string;
  equipment: string;
  overview: string[];
  instructions: string[];
  tips: string[];
  imageUrl: string | null;
  videoUrl: string | null;
};

type ExerciseLibraryResponse = {
  meta: {
    generatedAt: string;
    source: string;
    total: number;
    totalPages: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    catalogSize: number;
    bodyPartCount: number;
    primaryMuscleCount: number;
    equipmentCount: number;
  };
  filters: {
    bodyParts: string[];
    primaryMuscles: string[];
    equipments: string[];
  };
  items: ExerciseLibraryItem[];
};

const PAGE_SIZE = 24;

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80">
      <div className="aspect-video animate-pulse bg-slate-800/80" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-800/80" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-800/60" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-800/60" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-800/40" />
        </div>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const [query, setQuery] = useState('');
  const [bodyPart, setBodyPart] = useState('ALL');
  const [primaryMuscle, setPrimaryMuscle] = useState('ALL');
  const [equipment, setEquipment] = useState('ALL');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ExerciseLibraryResponse | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query.trim());
  const numberFormatter = useMemo(() => new Intl.NumberFormat('pt-BR'), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLibrary() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<ExerciseLibraryResponse>('/exercises/library', {
          params: {
            page,
            pageSize: PAGE_SIZE,
            query: deferredQuery || undefined,
            bodyPart: bodyPart !== 'ALL' ? bodyPart : undefined,
            primaryMuscle: primaryMuscle !== 'ALL' ? primaryMuscle : undefined,
            equipment: equipment !== 'ALL' ? equipment : undefined
          },
          signal: controller.signal
        });

        setData(response.data);
        setSelectedExerciseId((current) => {
          const currentExists = response.data.items.some((item) => item.sourceId === current);
          if (currentExists) {
            return current;
          }

          return response.data.items[0]?.sourceId ?? '';
        });
      } catch (loadError: any) {
        if (loadError.name === 'CanceledError' || loadError.code === 'ERR_CANCELED') {
          return;
        }

        setError('Não foi possível carregar a biblioteca agora.');
      } finally {
        setIsLoading(false);
      }
    }

    loadLibrary();

    return () => controller.abort();
  }, [bodyPart, deferredQuery, equipment, page, primaryMuscle]);

  const selectedExercise = data?.items.find((item) => item.sourceId === selectedExerciseId) ?? null;
  const generatedAtLabel = data ? new Date(data.meta.generatedAt).toLocaleDateString('pt-BR') : '';

  const updateFilter = (updater: () => void) => {
    updater();
    setPage(1);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-8">
          <Card className="overflow-hidden border border-rose-500/15 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_35%),radial-gradient(circle_at_right,rgba(56,189,248,0.14),transparent_30%),rgba(15,23,42,0.92)]">
            <CardContent className="grid gap-8 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
              <div className="space-y-5">
                <Badge className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200">
                  Biblioteca Fitwill em PT-BR
                </Badge>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    Visualização de exercícios mais fluida, com contexto rápido e passo a passo fácil de seguir.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-300">
                    Explore milhares de exercícios por busca, parte do corpo, músculo principal e equipamento. Cada item traz mídia, explicação resumida e instruções organizadas para facilitar o entendimento.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">Exercícios no catálogo</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {data ? numberFormatter.format(data.meta.catalogSize) : '...'}
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">Partes do corpo</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {data ? numberFormatter.format(data.meta.bodyPartCount) : '...'}
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">Atualizado em</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{generatedAtLabel || 'carregando...'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtros inteligentes</CardTitle>
              <CardDescription>
                Refine a lista sem perder velocidade. A busca considera nome, contexto do exercício, instruções e dicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
              <div>
                <label htmlFor="exercise-search" className="mb-2 block text-sm text-slate-300">
                  Buscar exercício
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="exercise-search"
                    value={query}
                    onChange={(event) => updateFilter(() => setQuery(event.target.value))}
                    placeholder="Ex.: abdominal, remada, kettlebell..."
                    className="pl-11"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="body-part" className="mb-2 block text-sm text-slate-300">
                  Parte do corpo
                </label>
                <select
                  id="body-part"
                  value={bodyPart}
                  onChange={(event) => updateFilter(() => setBodyPart(event.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white"
                >
                  <option value="ALL">Todas</option>
                  {data?.filters.bodyParts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="primary-muscle" className="mb-2 block text-sm text-slate-300">
                  Músculo principal
                </label>
                <select
                  id="primary-muscle"
                  value={primaryMuscle}
                  onChange={(event) => updateFilter(() => setPrimaryMuscle(event.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white"
                >
                  <option value="ALL">Todos</option>
                  {data?.filters.primaryMuscles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="equipment" className="mb-2 block text-sm text-slate-300">
                  Equipamento
                </label>
                <select
                  id="equipment"
                  value={equipment}
                  onChange={(event) => updateFilter(() => setEquipment(event.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white"
                >
                  <option value="ALL">Todos</option>
                  {data?.filters.equipments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,420px)]">
            <div className="space-y-5">
              <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p aria-live="polite" className="text-sm text-slate-400">
                    {isLoading
                      ? 'Carregando exercícios...'
                      : `${numberFormatter.format(data?.meta.total ?? 0)} resultados encontrados`}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Página {data?.meta.page ?? page} {data?.meta.totalPages ? `de ${data.meta.totalPages}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={isLoading || !data?.meta.hasPreviousPage}
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={isLoading || !data?.meta.hasNextPage}
                  >
                    Próxima
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>

              {error && (
                <Card className="border border-rose-500/20">
                  <CardContent className="py-6">
                    <p className="text-sm text-rose-200">{error}</p>
                  </CardContent>
                </Card>
              )}

              {!error && (
                <div className="grid gap-4 md:grid-cols-2">
                  {isLoading
                    ? Array.from({ length: 6 }, (_, index) => <LoadingCard key={index} />)
                    : data?.items.map((exercise) => {
                        const isActive = exercise.sourceId === selectedExerciseId;

                        return (
                          <button
                            key={exercise.sourceId}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setSelectedExerciseId(exercise.sourceId)}
                            className={cn(
                              'overflow-hidden rounded-[28px] border bg-slate-900/80 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400/50 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500',
                              isActive ? 'border-rose-400/60 shadow-[0_0_0_1px_rgba(251,113,133,0.2)]' : 'border-white/10'
                            )}
                          >
                            <div className="relative aspect-video overflow-hidden bg-slate-950">
                              {exercise.imageUrl ? (
                                <img
                                  src={exercise.imageUrl}
                                  alt={`Demonstração do exercício ${exercise.name}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-slate-900 text-slate-500">
                                  Sem imagem disponível
                                </div>
                              )}
                              {exercise.videoUrl && (
                                <div className="absolute right-3 top-3 rounded-full bg-slate-950/85 p-2 text-rose-300">
                                  <PlayCircle size={18} />
                                </div>
                              )}
                            </div>

                            <div className="space-y-4 p-4">
                              <div className="flex flex-wrap gap-2">
                                <Badge>{exercise.bodyPart}</Badge>
                                <Badge className="border-sky-400/40 bg-sky-500/10 text-sky-100">
                                  {exercise.primaryMuscle}
                                </Badge>
                              </div>

                              <div>
                                <h2 className="text-lg font-semibold text-white">{exercise.name}</h2>
                                <p className="mt-1 text-sm text-slate-400">{exercise.equipment}</p>
                              </div>

                              <p className="max-h-24 overflow-hidden text-sm leading-6 text-slate-300">
                                {exercise.overview[0] || 'Abra o exercício para ver instruções detalhadas e dicas.'}
                              </p>

                              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                <span>{exercise.instructions.length} passos</span>
                                <span>{exercise.tips.length} dicas</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                </div>
              )}

              {!isLoading && !error && data?.items.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-lg font-semibold text-white">Nenhum exercício encontrado</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Tente ajustar a busca ou remover um dos filtros para ampliar os resultados.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="order-2 xl:order-none">
              <Card className="sticky top-24 overflow-hidden">
                {selectedExercise ? (
                  <>
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      {selectedExercise.videoUrl ? (
                        <video
                          className="h-full w-full object-cover"
                          controls
                          preload="none"
                          poster={selectedExercise.imageUrl ?? undefined}
                          src={selectedExercise.videoUrl}
                        />
                      ) : selectedExercise.imageUrl ? (
                        <img
                          src={selectedExercise.imageUrl}
                          alt={`Visual do exercício ${selectedExercise.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-900 text-slate-500">
                          Sem mídia disponível
                        </div>
                      )}
                    </div>

                    <CardContent className="space-y-6 px-5 py-5">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge>{selectedExercise.bodyPart}</Badge>
                          <Badge className="border-sky-400/40 bg-sky-500/10 text-sky-100">
                            {selectedExercise.primaryMuscle}
                          </Badge>
                          <Badge className="border-amber-400/40 bg-amber-500/10 text-amber-100">
                            {selectedExercise.equipment}
                          </Badge>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-white">{selectedExercise.name}</h2>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {selectedExercise.overview[0] || 'Resumo não disponível para este exercício.'}
                          </p>
                          {selectedExercise.overview[1] && (
                            <p className="mt-3 text-sm leading-6 text-slate-400">{selectedExercise.overview[1]}</p>
                          )}
                        </div>
                      </div>

                      <section className="space-y-3">
                        <div className="flex items-center gap-2 text-white">
                          <ListOrdered size={18} className="text-rose-300" />
                          <h3 className="font-semibold">Como executar</h3>
                        </div>
                        <ol className="space-y-3">
                          {selectedExercise.instructions.map((step, index) => (
                            <li key={`${selectedExercise.sourceId}-step-${index}`} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-sm font-semibold text-rose-200">
                                {index + 1}
                              </span>
                              <p className="text-sm leading-6 text-slate-200">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </section>

                      <section className="space-y-3">
                        <div className="flex items-center gap-2 text-white">
                          <Lightbulb size={18} className="text-sky-300" />
                          <h3 className="font-semibold">Dicas para entender melhor</h3>
                        </div>
                        <ul className="space-y-3">
                          {selectedExercise.tips.map((tip, index) => (
                            <li key={`${selectedExercise.sourceId}-tip-${index}`} className="rounded-2xl border border-sky-400/10 bg-sky-500/5 p-3 text-sm leading-6 text-slate-200">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fonte original</p>
                        <a
                          href={selectedExercise.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-rose-200 transition hover:text-rose-100"
                        >
                          Abrir exercício no Fitwill
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="py-8">
                    <p className="text-sm text-slate-400">
                      Selecione um exercício da lista para ver instruções detalhadas, mídia e dicas de execução.
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
