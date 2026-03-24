import { useState, useEffect } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { getPatient, updatePatient, calculateAge, formatDate, type Patient } from '@/lib/data';
import { toast } from 'sonner';

export default function CadastroTab({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<Patient | undefined>();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', birthDate: '', cid: '', parentNames: '', phone: '' });

  useEffect(() => {
    const load = async () => {
      const p = await getPatient(patientId);
      setPatient(p);
      if (p) setForm({ name: p.name, birthDate: p.birthDate, cid: p.cid, parentNames: p.parentNames, phone: p.phone });
    };
    load();
  }, [patientId]);

  if (!patient) return null;

  async function handleSave() {
    await updatePatient(patientId, form);
    setPatient({ ...patient!, ...form });
    setEditing(false);
    toast.success('Dados atualizados!');
  }

  const ageYears = calculateAge(patient.birthDate);
  const birthMs = new Date(patient.birthDate).getTime();
  const nowMs = Date.now();
  const totalMonths = Math.floor((nowMs - birthMs) / (1000 * 60 * 60 * 24 * 30.44));

  const inputClass = "w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Editar Dados</h2>
          <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Data de Nascimento</label>
            <input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">CID</label>
            <input value={form.cid} onChange={e => setForm(f => ({ ...f, cid: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Responsáveis (Pai / Mãe)</label>
            <input value={form.parentNames} onChange={e => setForm(f => ({ ...f, parentNames: e.target.value }))} className={inputClass} placeholder="Ex: João Silva / Maria Silva" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Telefone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} />
          </div>
          <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98]">
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>
    );
  }

  const parentParts = patient.parentNames?.split('/').map(s => s.trim()) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Dados do Paciente</h2>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 border border-border px-3 py-1.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors active:scale-95"
        >
          <Pencil size={14} /> Editar
        </button>
      </div>

      {/* Identificação */}
      <div className="bg-card border rounded-2xl p-5">
        <h3 className="text-primary font-bold text-sm mb-4">Identificação</h3>
        <div className="space-y-3">
          <div className="flex">
            <span className="text-xs font-bold text-muted-foreground uppercase w-28 shrink-0">Nome</span>
            <span className="text-sm text-foreground">{patient.name}</span>
          </div>
          <div className="flex">
            <span className="text-xs font-bold text-muted-foreground uppercase w-28 shrink-0">Nascimento</span>
            <span className="text-sm text-foreground">{formatDate(patient.birthDate)}</span>
          </div>
          <div className="flex">
            <span className="text-xs font-bold text-muted-foreground uppercase w-28 shrink-0">Idade</span>
            <span className="text-sm text-foreground">{ageYears} anos e {totalMonths - ageYears * 12} meses ({totalMonths} meses)</span>
          </div>
          <div className="flex">
            <span className="text-xs font-bold text-muted-foreground uppercase w-28 shrink-0">CID</span>
            <span className="text-sm text-foreground">{patient.cid}</span>
          </div>
        </div>
      </div>

      {/* Responsáveis */}
      {patient.parentNames && (
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="text-primary font-bold text-sm mb-4">Responsáveis</h3>
          <div className="space-y-3">
            {parentParts.length >= 1 && (
              <div className="flex">
                <span className="text-xs font-bold text-muted-foreground uppercase w-28 shrink-0">PAI</span>
                <span className="text-sm text-foreground">{parentParts[0]}</span>
              </div>
            )}
            {parentParts.length >= 2 && (
              <div className="flex">
                <span className="text-xs font-bold text-muted-foreground uppercase w-28 shrink-0">MÃE</span>
                <span className="text-sm text-foreground">{parentParts[1]}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contato */}
      {patient.phone && (
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="text-primary font-bold text-sm mb-4">Contato</h3>
          <div className="flex">
            <span className="text-xs font-bold text-muted-foreground uppercase w-28 shrink-0">Telefone</span>
            <span className="text-sm text-foreground">{patient.phone}</span>
          </div>
        </div>
      )}
    </div>
  );
}
