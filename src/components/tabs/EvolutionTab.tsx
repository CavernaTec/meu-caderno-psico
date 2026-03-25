import { useEffect, useState } from 'react';
import { Plus, Trash2, Camera, X, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { getSessions, saveSession, deleteSession, formatDate, type Session, getABCRecords, saveABCRecord, deleteABCRecord, type ABCRecord } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function EvolutionTab({ patientId }: { patientId: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [abcRecords, setAbcRecords] = useState<ABCRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<'session' | 'abc'>('session');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [abcForm, setAbcForm] = useState({ antecedent: '', behavior: '', consequence: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'session' | 'abc'>('session');

  async function reload() {
    const list = await getSessions();
    setSessions(list.filter(s => s.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date)));
    const records = await getABCRecords(patientId);
    setAbcRecords(records.sort((a, b) => b.date.localeCompare(a.date)));
  }

  useEffect(() => { reload(); }, [patientId]);

  async function handleSave() {
    if (type === 'session') {
      if (!notes.trim()) { toast.error('Preencha a descrição.'); return; }
      await saveSession({ patientId, date, time: '', notes, completed: false });
    } else {
      if (!abcForm.behavior.trim()) { toast.error('Preencha o comportamento.'); return; }
      await saveABCRecord({ patientId, date, ...abcForm });
    }
    await reload();
    setNotes('');
    setAbcForm({ antecedent: '', behavior: '', consequence: '' });
    setIsAdding(false);
    toast.success('Registro salvo!');
  }

  async function confirmDelete() {
    if (!deleteId) return;
    if (deleteType === 'session') await deleteSession(deleteId);
    else await deleteABCRecord(deleteId);
    setDeleteId(null);
    await reload();
    toast.success('Registro removido.');
  }

  // Merge sessions and ABCs into a timeline
  const timeline = [
    ...sessions.map(s => ({ id: s.id, date: s.date, type: 'session' as const, content: s.notes })),
    ...abcRecords.map(r => ({ id: r.id, date: r.date, type: 'abc' as const, content: '', abc: r })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 pb-24">
      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-border">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="text-destructive" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-2">Excluir Registro</h3>
            <p className="text-muted-foreground text-center mb-8">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 font-bold text-muted-foreground bg-muted rounded-2xl">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 font-bold text-destructive-foreground bg-destructive rounded-2xl shadow-lg">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {isAdding ? (
        <div className="space-y-4">
          {/* Type selector */}
          <div className="flex bg-card p-1 rounded-2xl border border-border shadow-sm">
            <button 
              onClick={() => setType('session')}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                type === 'session' ? "bg-brand-600 text-primary-foreground shadow-md" : "text-muted-foreground"
              )}
            >
              <BookOpen size={18} /> Sessão
            </button>
            <button 
              onClick={() => setType('abc')}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                type === 'abc' ? "bg-destructive text-destructive-foreground shadow-md" : "text-muted-foreground"
              )}
            >
              <AlertCircle size={18} /> Registro ABC
            </button>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4 border border-border">
            {type === 'abc' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Antecedente</label>
                  <textarea className="w-full bg-muted border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-destructive outline-none min-h-[80px]" value={abcForm.antecedent} onChange={e => setAbcForm({...abcForm, antecedent: e.target.value})} placeholder="O que aconteceu antes?" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Comportamento</label>
                  <textarea className="w-full bg-muted border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-destructive outline-none min-h-[80px]" value={abcForm.behavior} onChange={e => setAbcForm({...abcForm, behavior: e.target.value})} placeholder="O que a criança fez?" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Consequência</label>
                  <textarea className="w-full bg-muted border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-destructive outline-none min-h-[80px]" value={abcForm.consequence} onChange={e => setAbcForm({...abcForm, consequence: e.target.value})} placeholder="O que ocorreu depois?" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Relato da Sessão</label>
                <textarea className="w-full bg-muted border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none min-h-[200px]" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Descreva a sessão, avanços e dificuldades..." />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setIsAdding(false)} className="flex-1 bg-card text-muted-foreground font-bold py-4 rounded-2xl border border-border">Cancelar</button>
            <button onClick={handleSave} className={cn("flex-[2] text-primary-foreground font-bold py-4 rounded-2xl shadow-lg", type === 'abc' ? "bg-destructive" : "bg-brand-600")}>
              Salvar Registro
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => setIsAdding(true)} 
            className="w-full bg-card border-2 border-dashed border-border text-muted-foreground font-bold py-6 rounded-3xl flex flex-col items-center gap-2 hover:border-brand-500 hover:text-brand-600 hover:bg-accent/30 transition-all"
          >
            <Plus size={32} />
            <span>Novo Registro de Evolução</span>
          </button>

          {/* Timeline */}
          <div className="space-y-4 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-border">
            {timeline.map((ev) => (
              <div key={`${ev.type}-${ev.id}`} className="relative pl-12">
                <div className={cn(
                  "absolute left-4 top-4 w-4 h-4 rounded-full border-2 border-card z-10",
                  ev.type === 'abc' ? "bg-destructive" : "bg-brand-600"
                )} />

                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {ev.type === 'abc' ? <AlertCircle size={14} className="text-destructive" /> : <BookOpen size={14} className="text-brand-600" />}
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", ev.type === 'abc' ? "text-destructive" : "text-brand-600")}>
                        {ev.type === 'abc' ? 'Registro ABC' : 'Sessão'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-bold">{formatDate(ev.date)}</span>
                      <button 
                        onClick={() => { setDeleteId(ev.id); setDeleteType(ev.type); }} 
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {ev.type === 'session' && (
                    <p className="text-sm text-foreground leading-relaxed">{ev.content}</p>
                  )}

                  {ev.type === 'abc' && ev.abc && (
                    <div className="space-y-2 mt-2">
                      <div><span className="text-[10px] font-bold text-amber-600 uppercase">Antecedente:</span> <span className="text-sm text-foreground">{ev.abc.antecedent}</span></div>
                      <div><span className="text-[10px] font-bold text-destructive uppercase">Comportamento:</span> <span className="text-sm text-foreground">{ev.abc.behavior}</span></div>
                      <div><span className="text-[10px] font-bold text-success uppercase">Consequência:</span> <span className="text-sm text-foreground">{ev.abc.consequence}</span></div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {timeline.length === 0 && (
              <div className="text-center py-12">
                <Clock size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum registro de evolução ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
