import { useEffect, useState, useRef } from 'react';
import { Plus, Calendar, Trash2, Camera, AlertTriangle } from 'lucide-react';
import { getSessions, saveSession, deleteSession, formatDate, type Session, getABCRecords, saveABCRecord, deleteABCRecord, type ABCRecord } from '@/lib/data';
import { toast } from 'sonner';

export default function EvolutionTab({ patientId }: { patientId: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [abcRecords, setAbcRecords] = useState<ABCRecord[]>([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showAbcForm, setShowAbcForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [abcForm, setAbcForm] = useState({ antecedent: '', behavior: '', consequence: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  async function reloadSessions() {
    const list = await getSessions();
    setSessions(
      list
        .filter(s => s.patientId === patientId)
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    );
  }

  async function reloadAbc() {
    const records = await getABCRecords(patientId);
    setAbcRecords(records.sort((a, b) => b.date.localeCompare(a.date)));
  }

  useEffect(() => { reloadSessions(); reloadAbc(); }, [patientId]);

  async function handleAddSession() {
    if (!notes.trim()) {
      toast.error('Preencha a descrição da sessão.');
      return;
    }
    await saveSession({ patientId, date, time: '', notes, completed: false });
    await reloadSessions();
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowSessionForm(false);
    toast.success('Sessão salva!');
  }

  async function handleDeleteSession(id: string) {
    if (!confirm('Remover esta sessão?')) return;
    await deleteSession(id);
    await reloadSessions();
    toast.success('Sessão removida.');
  }

  async function handleSaveAbc() {
    if (!abcForm.antecedent || !abcForm.behavior || !abcForm.consequence) {
      toast.error('Preencha todos os campos.');
      return;
    }
    await saveABCRecord({ patientId, date: new Date().toISOString().split('T')[0], ...abcForm });
    await reloadAbc();
    setAbcForm({ antecedent: '', behavior: '', consequence: '' });
    setShowAbcForm(false);
    toast.success('Registro ABC salvo!');
  }

  async function handleDeleteAbc(id: string) {
    if (!confirm('Remover este registro?')) return;
    await deleteABCRecord(id);
    await reloadAbc();
    toast.success('Registro removido.');
  }

  const inputClass = "w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  return (
    <div className="space-y-6">
      {/* Sessions Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Linha do Tempo de Sessões</h2>
            <p className="text-sm text-muted-foreground">{sessions.length} sessões registradas</p>
          </div>
          <button
            onClick={() => setShowSessionForm(!showSessionForm)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={16} /> Sessão
          </button>
        </div>

        {showSessionForm && (
          <div className="bg-card border rounded-2xl p-5 space-y-4 mb-4">
            <h3 className="font-bold text-foreground">Nova Sessão</h3>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Descrição da Sessão *</label>
              <textarea
                placeholder="Descreva as atividades, comportamentos e evolução observados..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Fotos</label>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 border border-border px-4 py-2 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Camera size={16} /> Adicionar Foto
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddSession} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98]">
                Salvar Sessão
              </button>
              <button onClick={() => setShowSessionForm(false)} className="px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted rounded-xl transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {sessions.length === 0 && !showSessionForm && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nenhuma sessão registrada ainda</p>
          </div>
        )}

        {sessions.map(session => (
          <div key={session.id} className="bg-card border rounded-2xl p-4 mb-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{formatDate(session.date)}</p>
                {session.notes && <p className="text-sm text-foreground mt-1 leading-relaxed">{session.notes}</p>}
              </div>
              <button onClick={() => handleDeleteSession(session.id)} className="text-muted-foreground hover:text-destructive transition-colors active:scale-90 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ABC Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Registro ABC</h2>
            <p className="text-sm text-muted-foreground">Antecedente · Comportamento · Consequência</p>
          </div>
          <button
            onClick={() => setShowAbcForm(!showAbcForm)}
            className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors active:scale-95"
          >
            <Plus size={16} /> ABC
          </button>
        </div>

        {showAbcForm && (
          <div className="bg-card border rounded-2xl p-5 space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Antecedente (A)</label>
              <textarea
                placeholder="O que aconteceu antes?"
                value={abcForm.antecedent}
                onChange={e => setAbcForm(f => ({ ...f, antecedent: e.target.value }))}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Comportamento (B)</label>
              <textarea
                placeholder="Qual foi o comportamento?"
                value={abcForm.behavior}
                onChange={e => setAbcForm(f => ({ ...f, behavior: e.target.value }))}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Consequência (C)</label>
              <textarea
                placeholder="O que foi feito em resposta?"
                value={abcForm.consequence}
                onChange={e => setAbcForm(f => ({ ...f, consequence: e.target.value }))}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <button onClick={handleSaveAbc} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98]">
              Salvar Registro
            </button>
          </div>
        )}

        {abcRecords.length === 0 && !showAbcForm && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Nenhum registro ABC encontrado.</p>
          </div>
        )}

        {abcRecords.map(record => (
          <div key={record.id} className="bg-card border rounded-2xl p-4 mb-2">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">{formatDate(record.date)}</p>
              <button onClick={() => handleDeleteAbc(record.id)} className="text-muted-foreground hover:text-destructive transition-colors active:scale-90 p-1">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-1.5">
              <div>
                <span className="text-xs font-bold text-primary">A</span>
                <p className="text-sm text-foreground">{record.antecedent}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-destructive">B</span>
                <p className="text-sm text-foreground">{record.behavior}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-success">C</span>
                <p className="text-sm text-foreground">{record.consequence}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
