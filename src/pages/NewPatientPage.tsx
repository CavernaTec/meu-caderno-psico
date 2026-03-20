import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate) {
      toast.error('Preencha ao menos o nome e a data de nascimento.');
      return;
    }
    const patient = savePatient(form);
    toast.success('Paciente cadastrado com sucesso!');
    navigate(`/pacientes/${patient.id}`);
  }

  const inputClass = "w-full px-4 py-3 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  return (
    <div className="container max-w-lg py-8 px-4 md:px-0">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors active:scale-95">
        <ArrowLeft size={18} />
        <span className="text-sm font-semibold">Voltar</span>
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6 animate-fade-in" style={{ lineHeight: '1.2' }}>Cadastrar Novo Paciente</h1>

      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Nome completo</label>
          <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da criança" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Data de nascimento</label>
          <input type="date" className={inputClass} value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">CID</label>
          <input className={inputClass} value={form.cid} onChange={e => setForm(f => ({ ...f, cid: e.target.value }))} placeholder="Ex: F84.0" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Nome dos pais / responsáveis</label>
          <input className={inputClass} value={form.parentNames} onChange={e => setForm(f => ({ ...f, parentNames: e.target.value }))} placeholder="Ex: Maria e João" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Telefone (WhatsApp)</label>
          <input className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="11999887766" />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity active:scale-[0.98] mt-4"
        >
          Salvar Registro
        </button>
      </form>
    </div>
  );
}
