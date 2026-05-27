import Link from 'next/link';
import { ArrowRight, Dumbbell, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  { title: 'Treinos inteligentes', description: 'Crie, personalize e acompanhe treinos com exercícios por grupo muscular.' },
  { title: 'Nutrição por medida', description: 'Calcule macros e planeje refeições com dados reais de alimentos.' },
  { title: 'Evolução constante', description: 'Acompanhe peso, medidas e progresso em gráficos dinâmicos.' },
  { title: 'Segurança enterprise', description: 'JWT, refresh tokens, proteção CSRF, rate limiting e validação de dados.' }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.24),_transparent_18%),linear-gradient(135deg,#020617,#111827)] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-300">FITZONE SYSTEM</p>
            <p className="text-xs text-slate-300">Plataforma fitness profissional</p>
          </div>
          <div className="flex gap-3">
            <Link href="/login"><Button variant="outline">Entrar</Button></Link>
            <Link href="/register"><Button>Começar agora</Button></Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge>SAAS FITNESS MODERNO</Badge>
            <h1 className="mt-4 text-4xl font-black sm:text-5xl">
              Transforme performance, nutrição e evolução em uma só plataforma.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-200">
              O FITZONE SYSTEM combina dashboard inteligente, gerenciamento de treinos, dieta e métricas físicas para entregar uma experiência premium e pronta para produção.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register"><Button size="lg">Criar conta <ArrowRight size={16} /></Button></Link>
              <Link href="/dashboard"><Button size="lg" variant="outline">Ver demo</Button></Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Flame className="text-rose-300" />
                <p className="mt-3 text-2xl font-bold">100%</p>
                <p className="text-sm text-slate-300">funcional e integrado</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="text-sky-300" />
                <p className="mt-3 text-2xl font-bold">JWT</p>
                <p className="text-sm text-slate-300">segurança protegida</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Sparkles className="text-amber-300" />
                <p className="mt-3 text-2xl font-bold">Premium</p>
                <p className="text-sm text-slate-300">UI responsiva e moderna</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-glow">
            <div className="rounded-2xl bg-slate-900 p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-300">Treino do dia</p>
                  <p className="text-xl font-bold">Superiores</p>
                </div>
                <Dumbbell className="text-rose-300" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2">Supino reto · 4x10</div>
                <div className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2">Remada curta · 4x12</div>
                <div className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2">Prancha · 3x45s</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-10 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="card-glass p-5">
              <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
