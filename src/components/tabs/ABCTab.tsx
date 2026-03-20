import { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { getABCRecords, saveABCRecord, formatDate, type ABCRecord } from '@/lib/data';
import { toast } from 'sonner';

const QUICK_ANTECEDENTS = ['Mudança de rotina', 'Demanda acadêmica', 'Frustração', 'Transição de atividade', 'Estímulo sensorial'];
const QUICK_BEHAVIORS = ['Choro', 'Grito', 'Autoestimulação', 'Agressão', 'Fuga da tarefa', 'Mordida'];
const QUICK_CONSEQUENCES = ['Redirecionado', 'Pausa sensorial', 'Apoio verbal', 'Ignorado', 'Mudança de atividade'];

export default function ABCTab({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<ABCRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ antecedent: '', behavior: '', consequence: '' });

  useEffect(() => {
    setRecords(getABCRecords(patientId).sort((a, b) => b.date.localeCompare(a.date)));
  }, [patientId]);

  function handleSave() {
    if (!form.antecedent || !form.behavior || !form.consequence) {
      toast.error('Preencha todos os campos.');
      return;
    }
    saveABCRecord({ patientId, date: new Date().toISOString().split('T')[0], ...form });
    setRecords(getABCRecords(patientId).sort((a, b) => b.date.localeCompare(a.date)));
    setForm({ antecedent: '', behavior: '', consequence: '' });
    setShowForm(false);
    toast.success('Registro salvo!');
  }

  function QuickSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? '' : opt)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all active:scale-95 ${
              value === opt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-foreground">Registro ABC</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:opacity-80 active:scale-95 transition-all">
          <Plus size={16} /> Novo Registro
        </button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground">Antecedente</label>
            <p className="text-xs text-muted-foreground">O que aconteceu antes?</p>
            <QuickSelect options={QUICK_ANTECEDENTS} value={form.antecedent} onChange={v => setForm(f => ({ ...f, antecedent: v }))} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Comportamento</label>
            <p className="text-xs text-muted-foreground">Qual foi o comportamento observado?</p>
            <QuickSelect options={QUICK_BEHAVIORS} value={form.behavior} onChange={v => setForm(f => ({ ...f, behavior: v }))} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Consequência</label>
            <p className="text-xs text-muted-foreground">O que foi feito em resposta?</p>
            <QuickSelect options={QUICK_CONSEQUENCES} value={form.consequence} onChange={v => setForm(f => ({ ...f, consequence: v }))} />
          </div>
          <button onClick={handleSave} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold active:scale-[0.98]">
            Salvar Registro
          </button>
        </div>
      )}

      {records.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum registro ABC encontrado.</p>
        </div>
      )}

      {records.map(record => (
        <div key={record.id} className="bg-card border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">{formatDate(record.date)}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-destructive/5 rounded-lg p-2.5">
              <p className="font-semibold text-destructive mb-0.5">Antecedente</p>
              <p className="text-foreground">{record.antecedent}</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-2.5">
              <p className="font-semibold text-primary mb-0.5">Comportamento</p>
              <p className="text-foreground">{record.behavior}</p>
            </div>
            <div className="bg-success/5 rounded-lg p-2.5">
              <p className="font-semibold text-success mb-0.5">Consequência</p>
              <p className="text-foreground">{record.consequence}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
