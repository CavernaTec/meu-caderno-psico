import { useEffect, useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { getGoals, saveGoal, updateGoal, deleteGoal, getStatusLabel, getStatusColor, type PTIGoal } from '@/lib/data';
import { toast } from 'sonner';

const AREAS = ['Comunicação', 'Social', 'Motricidade', 'Cognitivo', 'Autonomia', 'Comportamental'];
const STATUSES: PTIGoal['status'][] = ['not_started', 'in_progress', 'completed'];

export default function PTITab({ patientId }: { patientId: string }) {
  const [goals, setGoals] = useState<PTIGoal[]>([]);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [openInputs, setOpenInputs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const list = await getGoals(patientId);
      setGoals(list);
    };
    load();
  }, [patientId]);

  async function handleAdd(area: string) {
    const description = (customInputs[area] || '').trim();
    if (!description) {
      toast.error('Digite a meta antes de salvar.');
      return;
    }
    await saveGoal({ patientId, area, description, status: 'not_started', progress: 0 });
    setGoals(await getGoals(patientId));
    setCustomInputs(prev => ({ ...prev, [area]: '' }));
    setOpenInputs(prev => ({ ...prev, [area]: false }));
    toast.success('Meta adicionada!');
  }

  async function cycleStatus(goal: PTIGoal) {
    const idx = STATUSES.indexOf(goal.status);
    const nextStatus = STATUSES[(idx + 1) % STATUSES.length];
    const progress = nextStatus === 'completed' ? 100 : nextStatus === 'in_progress' ? 50 : 0;
    await updateGoal(goal.id, { status: nextStatus, progress });
    setGoals(await getGoals(patientId));
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta meta?')) return;
    await deleteGoal(id);
    setGoals(await getGoals(patientId));
    toast.success('Meta removida.');
  }

  const areaList = [...AREAS, ...new Set(goals.map(goal => goal.area).filter(area => !AREAS.includes(area)))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-foreground">Plano Terapêutico</h2>
      </div>

      {goals.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Target size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma meta cadastrada ainda.</p>
        </div>
      )}

      {areaList.map(area => {
        const areaGoals = goals.filter(goal => goal.area === area);
        return (
          <div key={area} className="bg-card border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-foreground">{area}</div>
              <button
                onClick={() => setOpenInputs(prev => ({ ...prev, [area]: !prev[area] }))}
                className="flex items-center gap-1.5 text-primary text-xs font-semibold hover:opacity-80 active:scale-95"
              >
                <Plus size={14} /> Outro
              </button>
            </div>

            {openInputs[area] && (
              <div className="bg-muted/40 rounded-xl p-3 space-y-2 mb-3">
                <input
                  placeholder="Descreva a meta personalizada..."
                  value={customInputs[area] || ''}
                  onChange={e => setCustomInputs(prev => ({ ...prev, [area]: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-card border rounded-lg text-sm focus:outline-none"
                />
                <button
                  onClick={() => handleAdd(area)}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold active:scale-[0.98]"
                >
                  Salvar Meta
                </button>
              </div>
            )}

            {areaGoals.length === 0 && !openInputs[area] && (
              <p className="text-xs text-muted-foreground">Nenhuma meta nesta categoria.</p>
            )}

            <div className="space-y-2">
              {areaGoals.map(goal => (
                <div key={goal.id} className="border border-border/60 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">{goal.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => cycleStatus(goal)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors active:scale-95 ${getStatusColor(goal.status)}`}
                      >
                        {getStatusLabel(goal.status)}
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors active:scale-90 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${goal.status === 'completed' ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
