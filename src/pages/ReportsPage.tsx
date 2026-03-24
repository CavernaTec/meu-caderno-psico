import { useEffect, useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { getPatients, type Patient } from '@/lib/data';
import { generatePatientReport } from '@/lib/pdfReport';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setPatients(await getPatients());
    };
    load();
  }, []);

  async function handleGenerate(preview = false) {
    if (!selectedPatient) {
      toast.error('Selecione um paciente.');
      return;
    }
    setGenerating(true);
    try {
      const ok = await generatePatientReport(selectedPatient, startDate || undefined, endDate || undefined, preview);
      if (ok) {
        toast.success(preview ? 'Visualização aberta em nova aba!' : 'Relatório gerado com sucesso! Verifique seus downloads.');
      } else {
        toast.error('Paciente não encontrado.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar relatório.');
    } finally {
      setGenerating(false);
    }
  }

  const inputClass = "w-full px-4 py-3 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  return (
    <div className="px-4 pb-6">
      <div className="animate-fade-in mb-6">
        <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: '1.2' }}>Relatórios</h1>
        <p className="text-muted-foreground text-sm mt-1">Gere relatórios profissionais em PDF.</p>
      </div>

      <div className="animate-slide-up space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Paciente</label>
          <select className={inputClass} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            <option value="">Selecione um paciente</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Data inicial</label>
            <input type="date" className={inputClass} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Data final</label>
            <input type="date" className={inputClass} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <button
          onClick={() => handleGenerate(true)}
          disabled={generating}
          className="w-full bg-accent text-accent-foreground py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:opacity-90 transition-opacity active:scale-[0.98] mt-4 border disabled:opacity-50"
        >
          <Eye size={20} />
          {generating ? 'Gerando...' : 'Visualizar Relatório'}
        </button>

        <button
          onClick={() => handleGenerate(false)}
          disabled={generating}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:opacity-90 transition-opacity active:scale-[0.98] mt-2 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <FileText size={20} />
          {generating ? 'Gerando...' : 'Baixar Relatório PDF'}
        </button>

        <div className="bg-accent/20 rounded-xl p-5 mt-6 text-center">
          <Download size={32} className="mx-auto mb-3 text-accent-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            O relatório incluirá: dados do paciente, metas do PTI, notas de evolução, registros ABC e fotos anexadas.
          </p>
        </div>
      </div>
    </div>
  );
}
