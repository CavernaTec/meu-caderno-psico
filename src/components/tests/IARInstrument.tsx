import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleSlash, HelpCircle, Volume2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import {
  IAR_AREA_LABELS,
  IAR_PROTOCOL_STEPS,
  computeIARProfile,
  type IARProtocolData,
  type IARProtocolScore,
  type IARVisualConfig,
} from '@/lib/iarProtocol';

type IARInstrumentProps = {
  data: IARProtocolData;
  onChange: (data: IARProtocolData) => void;
};

const SCORE_OPTIONS: { label: string; value: IARProtocolScore; style: string; icon: typeof Check }[] = [
  { label: 'Acertou (1)', value: 1, style: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30', icon: Check },
  { label: 'Ajuda (0,5)', value: 0.5, style: 'bg-amber-500/10 text-amber-700 border-amber-500/30', icon: HelpCircle },
  { label: 'Errou (0)', value: 0, style: 'bg-rose-500/10 text-rose-700 border-rose-500/30', icon: CircleSlash },
];

const COLOR_SWATCHES: { key: string; label: string; color: string; text: string }[] = [
  { key: 'vermelho', label: 'Vermelho', color: 'bg-red-500', text: 'text-red-700' },
  { key: 'azul', label: 'Azul', color: 'bg-blue-500', text: 'text-blue-700' },
  { key: 'amarelo', label: 'Amarelo', color: 'bg-yellow-400', text: 'text-yellow-700' },
  { key: 'verde', label: 'Verde', color: 'bg-emerald-500', text: 'text-emerald-700' },
  { key: 'preto', label: 'Preto', color: 'bg-neutral-900', text: 'text-neutral-700' },
  { key: 'branco', label: 'Branco', color: 'bg-white border border-neutral-300', text: 'text-neutral-700' },
];

function getStatusTone(status: string) {
  if (status === 'Suficiente') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  if (status === 'Em Emergência') return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
}

export default function IARInstrument({ data, onChange }: IARInstrumentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const step = IAR_PROTOCOL_STEPS[currentIndex];
  const responses = data.responses || {};
  const selected = responses[step.id];
  const profile = useMemo(() => computeIARProfile(responses), [responses]);

  function setScore(score: IARProtocolScore) {
    const next = {
      ...data,
      responses: { ...responses, [step.id]: score },
      updatedAt: new Date().toISOString(),
    };
    onChange(next);
    if (currentIndex < IAR_PROTOCOL_STEPS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function goPrev() {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  function goNext() {
    setCurrentIndex((prev) => Math.min(IAR_PROTOCOL_STEPS.length - 1, prev + 1));
  }

  const progress = Math.round(((currentIndex + 1) / IAR_PROTOCOL_STEPS.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{IAR_AREA_LABELS[step.area]}</p>
            <h4 className="text-base font-semibold text-foreground">{step.title}</h4>
          </div>
          <div className="text-xs text-muted-foreground">
            Etapa {currentIndex + 1} de {IAR_PROTOCOL_STEPS.length}
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Área da Criança</p>
          <div className="mt-4 flex min-h-[280px] items-center justify-center rounded-2xl bg-muted/40 p-4">
            <VisualBoard visual={step.visual} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Volume2 size={14} /> Instrução de Voz
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">{step.instruction}</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Área da Profissional</p>
            <div className="mt-3 grid gap-2">
              {SCORE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = selected === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setScore(option.value)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-[0.98] ${
                      isActive ? option.style : 'bg-muted text-muted-foreground border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} /> {option.label}
                    </span>
                    {isActive ? <Check size={14} /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-semibold text-muted-foreground transition-all disabled:opacity-50"
            >
              <ArrowLeft size={14} /> Voltar
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === IAR_PROTOCOL_STEPS.length - 1 || selected === undefined}
              className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all disabled:opacity-50"
            >
              Avançar <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Perfil de Prontidão para Alfabetização</p>
            <h4 className="text-base font-semibold text-foreground">Resumo por área</h4>
          </div>
          <div className="text-xs text-muted-foreground">Respondidas: {profile.answered}/{IAR_PROTOCOL_STEPS.length}</div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-2">
            {profile.areas.map((area) => (
              <div key={area.area} className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{area.label}</p>
                  <p className="text-xs text-muted-foreground">{area.percentage}%</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(area.status)}`}>
                  {area.status}
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-2">
            <ChartContainer
              config={{
                score: {
                  label: 'Pontuação',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="h-[260px]"
            >
              <RadarChart data={profile.areas.map(a => ({ area: a.label, score: a.percentage }))}>
                <PolarGrid />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar dataKey="score" stroke="var(--color-score)" fill="var(--color-score)" fillOpacity={0.25} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualBoard({ visual }: { visual: IARVisualConfig }) {
  if (visual.type === 'cores') {
    return (
      <div className="grid grid-cols-3 gap-4">
        {COLOR_SWATCHES.map((swatch) => (
          <div
            key={swatch.key}
            className={`flex flex-col items-center gap-2 rounded-2xl px-4 py-3 ${
              visual.highlight === swatch.key ? 'bg-white shadow-md' : 'bg-white/70'
            }`}
          >
            <div className={`h-12 w-12 rounded-full ${swatch.color}`} />
            <span className={`text-xs font-semibold ${swatch.text}`}>{swatch.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === 'corpo') {
    return <BodyMap focus={visual.focus} />;
  }

  if (visual.type === 'lateralidade') {
    return <LateralityBoard target={visual.target} />;
  }

  if (visual.type === 'posicao') {
    return <PositionBoard relation={visual.relation} />;
  }

  if (visual.type === 'visual') {
    return <VisualDiscrimination task={visual.task} />;
  }

  if (visual.type === 'auditiva') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
          <Volume2 size={18} /> {visual.pair}
        </div>
        {visual.rhyme ? (
          <span className="text-xs font-medium text-muted-foreground">{visual.rhyme}</span>
        ) : null}
      </div>
    );
  }

  return <AnalysisBoard missing={visual.missing} />;
}

function BodyMap({ focus }: { focus: 'cabeca' | 'olhos' | 'boca' | 'ombro' | 'joelho' }) {
  const highlight = 'fill-amber-400';
  const muted = 'fill-neutral-200';
  return (
    <svg width="220" height="260" viewBox="0 0 220 260" aria-hidden>
      <circle cx="110" cy="45" r="30" className={focus === 'cabeca' ? highlight : muted} />
      <circle cx="98" cy="40" r="4" className={focus === 'olhos' ? highlight : 'fill-neutral-400'} />
      <circle cx="122" cy="40" r="4" className={focus === 'olhos' ? highlight : 'fill-neutral-400'} />
      <rect x="88" y="55" width="44" height="8" rx="4" className={focus === 'boca' ? highlight : 'fill-neutral-300'} />
      <rect x="85" y="80" width="50" height="80" rx="24" className="fill-neutral-300" />
      <rect x="40" y="90" width="50" height="14" rx="7" className={focus === 'ombro' ? highlight : muted} />
      <rect x="130" y="90" width="50" height="14" rx="7" className={focus === 'ombro' ? highlight : muted} />
      <rect x="90" y="165" width="15" height="70" rx="7" className="fill-neutral-300" />
      <rect x="115" y="165" width="15" height="70" rx="7" className="fill-neutral-300" />
      <rect x="85" y="210" width="25" height="12" rx="6" className={focus === 'joelho' ? highlight : 'fill-neutral-400'} />
      <rect x="110" y="210" width="25" height="12" rx="6" className={focus === 'joelho' ? highlight : 'fill-neutral-400'} />
    </svg>
  );
}

function LateralityBoard({ target }: { target: 'direita' | 'esquerda' }) {
  const active = 'bg-emerald-500/20 border-emerald-500/40';
  const muted = 'bg-white/80 border-transparent';
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className={`rounded-2xl border p-4 text-center ${target === 'esquerda' ? active : muted}`}>
        <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/30" />
        <p className="mt-2 text-xs font-semibold text-muted-foreground">Esquerda</p>
      </div>
      <div className={`rounded-2xl border p-4 text-center ${target === 'direita' ? active : muted}`}>
        <div className="mx-auto h-16 w-16 rounded-2xl bg-sky-500/30" />
        <p className="mt-2 text-xs font-semibold text-muted-foreground">Direita</p>
      </div>
    </div>
  );
}

function PositionBoard({ relation }: { relation: 'em_cima' | 'embaixo' | 'dentro' | 'ao_lado' | 'frente' | 'atras' }) {
  const base = 'rounded-2xl border border-dashed border-neutral-300 bg-white/80';
  return (
    <div className="grid gap-4">
      <div className={`relative h-44 w-44 ${base}`}>
        {relation === 'em_cima' && <div className="absolute left-16 top-4 h-12 w-12 rounded-full bg-amber-400" />}
        {relation === 'embaixo' && <div className="absolute left-16 bottom-4 h-12 w-12 rounded-full bg-amber-400" />}
        {relation === 'dentro' && <div className="absolute left-16 top-16 h-12 w-12 rounded-full bg-amber-400" />}
        {relation === 'ao_lado' && <div className="absolute right-4 top-16 h-12 w-12 rounded-full bg-amber-400" />}
        {relation === 'frente' && <div className="absolute left-8 top-10 h-12 w-12 rounded-full bg-amber-400" />}
        {relation === 'atras' && <div className="absolute right-8 bottom-10 h-12 w-12 rounded-full bg-amber-400" />}
        <div className="absolute inset-8 rounded-xl border border-neutral-300 bg-neutral-100" />
      </div>
    </div>
  );
}

function VisualDiscrimination({ task }: { task: 'igual' | 'diferente' | 'maior' | 'menor' | 'forma' }) {
  const shapes = {
    igual: [
      <div key="1" className="h-12 w-12 rounded-xl bg-sky-400" />,
      <div key="2" className="h-12 w-12 rounded-xl bg-sky-400" />,
      <div key="3" className="h-12 w-12 rounded-xl bg-sky-400" />,
    ],
    diferente: [
      <div key="1" className="h-12 w-12 rounded-xl bg-sky-400" />,
      <div key="2" className="h-12 w-12 rounded-full bg-amber-400" />,
      <div key="3" className="h-12 w-12 rounded-xl bg-sky-400" />,
    ],
    maior: [
      <div key="1" className="h-10 w-10 rounded-xl bg-emerald-400" />,
      <div key="2" className="h-16 w-16 rounded-xl bg-emerald-400" />,
    ],
    menor: [
      <div key="1" className="h-16 w-16 rounded-xl bg-emerald-400" />,
      <div key="2" className="h-10 w-10 rounded-xl bg-emerald-400" />,
    ],
    forma: [
      <div key="1" className="h-12 w-12 rounded-xl bg-rose-400" />,
      <div key="2" className="h-12 w-12 rounded-full bg-rose-400" />,
      <div key="3" className="h-0 w-0 border-l-[26px] border-r-[26px] border-b-[45px] border-l-transparent border-r-transparent border-b-rose-400" />,
    ],
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {shapes[task]}
    </div>
  );
}

function AnalysisBoard({ missing }: { missing: 'triangulo' | 'circulo' | 'quadrado' }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white/80 p-4">
        <div className="h-24 w-24 rounded-xl bg-neutral-200" />
        <div className="mt-3 h-8 w-8 rounded-full bg-neutral-300" />
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`h-12 w-12 ${missing === 'quadrado' ? 'rounded-xl bg-amber-400' : 'rounded-xl bg-neutral-200'}`} />
        <div className={`h-12 w-12 ${missing === 'circulo' ? 'rounded-full bg-amber-400' : 'rounded-full bg-neutral-200'}`} />
        <div className={`${missing === 'triangulo' ? 'border-b-amber-400' : 'border-b-neutral-200'} h-0 w-0 border-l-[24px] border-r-[24px] border-b-[42px] border-l-transparent border-r-transparent`} />
      </div>
    </div>
  );
}
