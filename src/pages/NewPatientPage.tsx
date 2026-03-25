import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { savePatient } from '@/lib/data';
import { toast } from 'sonner';

export default function NewPatientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    cid: '',
    parentNames: '',
    phone: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate) {
      toast.error('Preencha ao menos o nome e a data de nascimento.');
      return;
    }
    const patient = await savePatient(form);
    toast.success('Paciente cadastrado com sucesso!');
    navigate(`/pacientes/${patient.id}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-card">
      <header className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 z-40">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <h1 className="text-lg font-display font-bold text-foreground">Novo Paciente</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-auto">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nome Completo</label>
          <input
            required
            type="text"
            className="w-full bg-muted border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data de Nascimento</label>
          <input
            required
            type="date"
            className="w-full bg-muted border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
            value={form.birthDate}
            onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">CID</label>
          <input
            type="text"
            placeholder="Ex: F84.0"
            className="w-full bg-muted border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
            value={form.cid}
            onChange={e => setForm(f => ({ ...f, cid: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Responsáveis</label>
          <input
            type="text"
            className="w-full bg-muted border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
            value={form.parentNames}
            onChange={e => setForm(f => ({ ...f, parentNames: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Contato (WhatsApp)</label>
          <input
            type="tel"
            placeholder="DDD + Número"
            className="w-full bg-muted border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </form>

      <div className="p-6 border-t border-border">
        <button
          onClick={handleSubmit}
          className="w-full bg-brand-600 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <Save size={20} /> Salvar Cadastro
        </button>
      </div>
    </div>
  );
}
