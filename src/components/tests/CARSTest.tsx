import { useState, useEffect, useMemo } from 'react';
import { Save, Activity } from 'lucide-react';
import { toast } from 'sonner';
import {
  CARS_ITEMS, getCARSData, saveCARSData, calculateCARSResult,
  type CARSData,
} from '@/lib/testsData';

const SCORE_OPTIONS = [
  { value: 1, label: '1 — Normal', color: 'bg-success/15 text-success border-success/30' },
  { value: 2, label: '2 — Leve', color: 'bg-primary/15 text-primary border-primary/30' },
  { value: 3, label: '3 — Moderado', color: 'bg-accent/15 text-accent border-accent/30' },
  { value: 4, label: '4 — Grave', color: 'bg-destructive/15 text-destructive border-destructive/30' },
];

export default function CARSTest({ patientId }: { patientId: string }) {
  const [data, setData] = useState<CARSData>({ scores: {} });

  useEffect(() => {
    const load = async () => {
      setData(await getCARSData(patientId));
    };
    load();
  }, [patientId]);

  const result = useMemo(() => calculateCARSResult(data), [data]);

  function setScore(itemId: string, score: number) {
    setData(prev => ({ ...prev, scores: { ...prev.scores, [itemId]: score } }));
  }

  async function handleSave() {
    await saveCARSData(patientId, data);
    toast.success('CARS salva com sucesso!');
  }

  const classColor = result.total < 30
    ? 'bg-success/10 text-success border-success/30'
    : result.total <= 36
    ? 'bg-accent/10 text-accent border-accent/30'
    : 'bg-destructive/10 text-destructive border-destructive/30';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">CARS (Escala de Avaliação)</h3>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
          <Save size={16} />
          Salvar
        </button>
      </div>

      {/* Result */}
      {result.answered === 15 && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${classColor}`}>
          <div className="text-2xl font-bold">{result.total}</div>
          <div>
            <p className="text-sm font-bold">{result.classification}</p>
            <p className="text-xs">
              {result.total < 30
                ? 'Pontuação abaixo de 30 — Sem indicação de autismo.'
                : result.total <= 36
                ? 'Pontuação entre 30-36 — Autismo Leve a Moderado.'
                : 'Pontuação acima de 36 — Autismo Grave.'}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{result.answered} de {result.totalItems} itens avaliados</p>

      <div className="space-y-2">
        {CARS_ITEMS.map((item, i) => (
          <div key={item.id} className="bg-card border rounded-xl p-3 shadow-sm">
            <p className="text-xs font-medium text-foreground mb-2">
              <span className="text-muted-foreground">{i + 1}.</span> {item.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SCORE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setScore(item.id, opt.value)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all active:scale-95 ${
                    data.scores[item.id] === opt.value ? opt.color : 'bg-muted text-muted-foreground border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
