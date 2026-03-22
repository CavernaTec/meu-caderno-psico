import { useEffect, useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { getGoals, saveGoal, updateGoal, deleteGoal, getStatusLabel, getStatusColor, type PTIGoal } from '@/lib/data';
import { toast } from 'sonner';

const AREAS = ['Comunicação', 'Social', 'Motor', 'Cognitivo', 'Autonomia', 'Comportamental', 'Outro'];
const STATUSES: PTIGoal['status'][] = ['not_started', 'in_progress', 'completed'];

export default function PTITab({ patientId }: { patientId: string }) {
  const [goals, setGoals] = useState<PTIGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ area: AREAS[0], description: '', customArea: '' });

  useEffect(() => {
    setGoals(getGoals(patientId));
  }, [patientId]);

  function handleAdd() {
    if (!newGoal.description.trim()) return;
    const areaName = newGoal.area === 'Outro' ? (newGoal.customArea.trim() || 'Outro') : newGoal.area;
    if (newGoal.area === 'Outro' && !newGoal.customArea.trim()) {
      toast.error('Digite o nome da categoria personalizada.');
      return;
    }
    saveGoal({ patientId, area: areaName, description: newGoal.description, status: 'not_started', progress: 0 });
    setGoals(getGoals(patientId));
    setNewGoal({ area: AREAS[0], description: '', customArea: '' });
    setShowForm(false);
    toast.success('Meta adicionada!');
  }

  function cycleStatus(goal: PTIGoal) {
    const idx = STATUSES.indexOf(goal.status);
    const nextStatus = STATUSES[(idx + 1) % STATUSES.length];
    const progress = nextStatus === 'completed' ? 100 : nextStatus === 'in_progress' ? 50 : 0;
    updateGoal(goal.id, { status: nextStatus, progress });
    setGoals(getGoals(patientId));
  }

  function handleDelete(id: string) {
    if (!confirm('Remover esta meta?')) return;
    deleteGoal(id);
    setGoals(getGoals(patientId));
    toast.success('Meta removida.');
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-foreground">Plano Terapêutico</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:opacity-80 active:scale-95 transition-all">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <select
            value={newGoal.area}
            onChange={e => setNewGoal(g => ({ ...g, area: e.target.value }))}
            className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none"
          >
             {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
           </select>
           {newGoal.area === 'Outro' && (
             <input
               placeholder="Nome da categoria personalizada..."
               value={newGoal.customArea}
               onChange={e => setNewGoal(g => ({ ...g, customArea: e.target.value }))}
               className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none"
             />
           )}
          <input
            placeholder="Descreva a meta..."
            value={newGoal.description}
            onChange={e => setNewGoal(g => ({ ...g, description: e.target.value }))}
            className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none"
          />
          <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold active:scale-[0.98]">
            Salvar Meta
          </button>
        </div>
      )}

      {goals.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Target size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma meta cadastrada ainda.</p>
        </div>
      )}

      {goals.map(goal => (
        <div key={goal.id} className="bg-card border rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{goal.area}</span>
              <p className="text-sm text-foreground mt-1.5 font-medium">{goal.description}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => cycleStatus(goal)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors active:scale-95 ${getStatusColor(goal.status)}`}
              >
                {getStatusLabel(goal.status)}
              </button>
              <button onClick={() => handleDelete(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors active:scale-90 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${goal.status === 'completed' ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
