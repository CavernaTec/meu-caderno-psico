import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Trash2, Share2 } from 'lucide-react';
import { getPatient, deletePatient, calculateAge, type Patient } from '@/lib/data';
import PatientTabs from '@/components/PatientTabs';
import { toast } from 'sonner';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | undefined>();
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (id) setPatient(await getPatient(id));
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Carregando prontuário...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 py-16 text-center">
        <p className="text-muted-foreground text-lg">Paciente não encontrado.</p>
        <button onClick={() => navigate('/pacientes')} className="text-brand-600 font-bold mt-4 text-sm hover:underline">Voltar à lista</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border h-16 flex items-center px-4 z-40 justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pacientes')} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-foreground truncate">{patient.name}</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">{calculateAge(patient.birthDate)} anos • {patient.cid || 'Sem CID'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-destructive/50 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
            title="Excluir Paciente"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-border">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="text-destructive" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-2">Excluir Paciente</h3>
            <p className="text-muted-foreground text-center mb-8">
              Tem certeza que deseja excluir <strong>{patient.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 font-bold text-muted-foreground bg-muted rounded-2xl hover:bg-border transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  await deletePatient(patient.id);
                  toast.success('Paciente excluído com sucesso!');
                  navigate('/pacientes');
                }}
                className="flex-1 py-3 font-bold text-destructive-foreground bg-destructive rounded-2xl hover:opacity-90 transition-colors shadow-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6 pb-24">
        <PatientTabs patientId={patient.id} />
      </div>
    </div>
  );
}
