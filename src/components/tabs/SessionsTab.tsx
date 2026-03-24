import { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { getSessions, saveSession, deleteSession, updateSession, formatDate, type Session } from '@/lib/data';
import { toast } from 'sonner';

export default function SessionsTab({ patientId }: { patientId: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');

  async function reload() {
    const list = await getSessions();
    setSessions(
      list
        .filter(s => s.patientId === patientId)
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    );
  }

  useEffect(() => { reload(); }, [patientId]);

  async function handleAdd() {
    if (!date || !time) {
      toast.error('Preencha data e horário.');
      return;
    }
    await saveSession({ patientId, date, time, notes, completed: false });
    await reload();
    setDate(new Date().toISOString().split('T')[0]);
    setTime('08:00');
    setNotes('');
    setShowForm(false);
    toast.success('Sessão agendada!');
  }

  async function handleToggleComplete(session: Session) {
    await updateSession(session.id, { completed: !session.completed });
    await reload();
    toast.success(session.completed ? 'Sessão reaberta.' : 'Sessão concluída!');
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta sessão?')) return;
    await deleteSession(id);
    await reload();
    toast.success('Sessão removida.');
  }

  const inputClass = "w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-foreground">Sessões</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:opacity-80 active:scale-95 transition-all">
          <Plus size={16} /> Agendar
        </button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Horário</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} />
            </div>
          </div>
          <textarea
            placeholder="Observações (opcional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className={`${inputClass} resize-none`}
          />
          <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold active:scale-[0.98]">
            Salvar Sessão
          </button>
        </div>
      )}

      {sessions.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma sessão agendada.</p>
        </div>
      )}

      {sessions.map(session => (
        <div key={session.id} className={`relative bg-card border rounded-xl p-4 shadow-sm ${session.completed ? 'opacity-70' : ''}`}>
          <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-emerald-400" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleComplete(session)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors active:scale-95 ${
                  session.completed ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                }`}
              >
                {session.completed ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              </button>
              <div className="pl-2">
                <p className="font-semibold text-foreground text-sm">{formatDate(session.date)}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {session.time}
                  {session.completed && <span className="text-success ml-2">· Concluída</span>}
                </p>
                {session.notes && <p className="text-muted-foreground text-xs mt-1">{session.notes}</p>}
              </div>
            </div>
            <button onClick={() => handleDelete(session.id)} className="text-muted-foreground hover:text-destructive transition-colors active:scale-90 p-1">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
