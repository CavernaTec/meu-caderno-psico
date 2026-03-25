import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronRight, Users, Trash2 } from 'lucide-react';
import { getPatients, deletePatient, calculateAge, type Patient } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setPatients(await getPatients());
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.cid.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    if (!patientToDelete) return;
    await deletePatient(patientToDelete.id);
    setPatientToDelete(null);
    await loadPatients();
    toast.success('Paciente excluído com sucesso!');
  }

  return (
    <div className="flex flex-col bg-background">
      <header className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border h-16 flex items-center px-6 z-40 justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">Pacientes</h1>
        <Link to="/pacientes/novo" className="md:hidden p-2 text-brand-600 hover:bg-accent rounded-full transition-colors">
          <Plus size={24} />
        </Link>
      </header>

      <div className="p-6 space-y-6 flex-1 overflow-auto w-full">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CID..." 
              className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className="w-full glass-card p-5 rounded-2xl flex items-center justify-between hover:border-brand-500 hover:shadow-md transition-all group text-left cursor-pointer border border-border"
                style={{ animation: `fadeIn 0.4s ease ${i * 50}ms both` }}
                onClick={() => navigate(`/pacientes/${p.id}`)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground font-bold group-hover:bg-accent group-hover:text-brand-600 transition-colors shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-lg truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {calculateAge(p.birthDate)} anos • {p.cid || 'Sem CID'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPatientToDelete(p);
                    }}
                    className="p-2 text-destructive/50 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight size={20} className="text-muted-foreground/50 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={40} className="text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-medium">Nenhum paciente encontrado.</p>
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="text-brand-600 font-bold mt-2 hover:underline"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Link
        to="/pacientes/novo"
        className="hidden md:flex fixed bottom-8 right-8 btn-primary h-14 px-6 items-center gap-2 shadow-xl z-40"
      >
        <Plus size={24} />
        <span>Novo Paciente</span>
      </Link>

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-border">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="text-destructive" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-2">Excluir Paciente</h3>
            <p className="text-muted-foreground text-center mb-8">
              Tem certeza que deseja excluir <strong>{patientToDelete.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPatientToDelete(null)}
                className="flex-1 py-4 font-bold text-muted-foreground bg-muted rounded-2xl hover:bg-border transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 font-bold text-destructive-foreground bg-destructive rounded-2xl hover:opacity-90 transition-colors shadow-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
