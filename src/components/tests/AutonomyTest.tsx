import { useState, useEffect, useMemo } from 'react';
import { Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  AUTONOMY_ITEMS, AUTONOMY_LEVELS,
  getAutonomyData, saveAutonomyData, calculateAutonomyResults,
  type AutonomyData, type AutonomyScore,
} from '@/lib/testsData';

export default function AutonomyTest({ patientId }: { patientId: string }) {
  const [data, setData] = useState<AutonomyData>({ scores: {}, observacoes: '' });

  useEffect(() => {
    const load = async () => {
      setData(await getAutonomyData(patientId));
    };
    load();
  }, [patientId]);

  const results = useMemo(() => calculateAutonomyResults(data), [data]);
  const categories = [...new Set(AUTONOMY_ITEMS.map(i => i.category))];

  function setScore(itemId: string, score: AutonomyScore) {
    setData(prev => ({ ...prev, scores: { ...prev.scores, [itemId]: score } }));
  }

  async function handleSave() {
    await saveAutonomyData(patientId, data);
    toast.success('Avaliação de Autonomia salva!');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Avaliação de Autonomia</h3>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
          <Save size={16} />
          Salvar
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {categories.map(cat => (
          <div key={cat} className="bg-card border rounded-xl p-3 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground mb-1">{cat}</p>
            <div className="flex items-center gap-2">
              <Progress value={results[cat]?.percentage || 0} className="h-2 flex-1" />
              <span className="text-xs font-bold text-primary">{results[cat]?.percentage || 0}%</span>
            </div>
          </div>
        ))}
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{cat}</h4>
          <div className="space-y-2">
            {AUTONOMY_ITEMS.filter(i => i.category === cat).map(item => (
              <div key={item.id} className="bg-card border rounded-xl p-3 shadow-sm">
                <p className="text-xs text-foreground mb-2">{item.text}</p>
                <div className="flex flex-wrap gap-1">
                  {AUTONOMY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setScore(item.id, level.value as AutonomyScore)}
                      title={level.desc}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all active:scale-95 ${
                        data.scores[item.id] === level.value
                          ? 'bg-primary/15 text-primary border-primary/30'
                          : 'bg-muted text-muted-foreground border-transparent'
                      }`}
                    >
                      {level.value} - {level.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-card border rounded-xl p-3 shadow-sm">
        <p className="text-xs font-medium text-foreground mb-2">Observações Gerais</p>
        <Textarea
          placeholder="Observações sobre a autonomia da criança..."
          value={data.observacoes}
          onChange={e => setData(prev => ({ ...prev, observacoes: e.target.value }))}
          className="text-sm min-h-[80px]"
        />
      </div>
    </div>
  );
}
