import { useEffect, useState } from 'react';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { getNotes, saveNote, deleteNote, formatDate, type EvolutionNote } from '@/lib/data';
import { toast } from 'sonner';

export default function EvolutionTab({ patientId }: { patientId: string }) {
  const [notes, setNotes] = useState<EvolutionNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');

  function reload() {
    setNotes(getNotes(patientId).sort((a, b) => b.date.localeCompare(a.date)));
  }

  useEffect(() => { reload(); }, [patientId]);

  function handleAdd() {
    if (!content.trim()) return;
    saveNote({ patientId, date: new Date().toISOString().split('T')[0], content });
    reload();
    setContent('');
    setShowForm(false);
    toast.success('Nota de evolução salva!');
  }

  function handleDelete(id: string) {
    if (!confirm('Remover esta nota?')) return;
    deleteNote(id);
    reload();
    toast.success('Nota removida.');
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-foreground">Evolução</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:opacity-80 active:scale-95 transition-all">
          <Plus size={16} /> Nova Nota
        </button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <textarea
            placeholder="Descreva a evolução da sessão..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none resize-none"
          />
          <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold active:scale-[0.98]">
            Salvar Registro
          </button>
        </div>
      )}

      {notes.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma nota de evolução registrada.</p>
        </div>
      )}

      <div className="relative">
        {notes.length > 1 && (
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border" />
        )}
        {notes.map(note => (
          <div key={note.id} className="flex gap-4 mb-4 relative">
            <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center shrink-0 z-10">
              <BookOpen size={16} className="text-accent-foreground" />
            </div>
            <div className="flex-1 bg-card border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">{formatDate(note.date)}</p>
                <button onClick={() => handleDelete(note.id)} className="text-muted-foreground hover:text-destructive transition-colors active:scale-90 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
