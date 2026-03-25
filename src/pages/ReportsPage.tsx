import { useEffect, useState } from 'react';
import { ChevronRight, FileText, Search, UserCheck } from 'lucide-react';
import { getPatients, type Patient } from '@/lib/data';
import { generatePatientReport } from '@/lib/pdfReport';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => setPatients(await getPatients());
    load();
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSelectPatient(patientId: string) {
    toast.loading('Gerando relatório...');
    try {
      const ok = await generatePatientReport(patientId);
      if (ok) toast.success('Relatório gerado!');
      else toast.error('Paciente não encontrado.');
    } catch {
      toast.error('Erro ao gerar relatório.');
    }
  }

  return (
    <div className="flex flex-col bg-background">
      <header className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border h-16 flex items-center px-6 z-40">
        <h1 className="text-xl font-display font-bold text-foreground">Relatórios Profissionais</h1>
      </header>
      
      <div className="p-6 space-y-6 flex-1 overflow-auto w-full">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-brand-600 p-8 rounded-[2rem] text-primary-foreground shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-lg">
              <h2 className="text-2xl font-bold mb-2">Gerador de PDF Profissional</h2>
              <p className="text-sm opacity-90 leading-relaxed">
                Selecione um paciente para compilar todos os testes (IAR, Portage, EOCA, PTI) em um único documento A4 profissional pronto para impressão.
              </p>
            </div>
            <FileText className="absolute -right-4 -bottom-4 text-white/10" size={160} />
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar paciente pelo nome..." 
              className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p, i) => (
              <button 
                key={p.id}
                onClick={() => handleSelectPatient(p.id)}
                className="w-full bg-card p-5 rounded-2xl flex items-center justify-between hover:border-brand-500 hover:shadow-md transition-all group border border-border text-left"
                style={{ animation: `fadeIn 0.4s ease ${i * 50}ms both` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-brand-600 transition-colors">
                    <UserCheck size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-lg truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">Pronto para exportação</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-[10px] font-bold text-brand-600 bg-accent px-3 py-1 rounded-full uppercase tracking-wider">Compilar PDF</span>
                  <ChevronRight size={20} className="text-muted-foreground/50 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={40} className="text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-medium">Nenhum paciente encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
