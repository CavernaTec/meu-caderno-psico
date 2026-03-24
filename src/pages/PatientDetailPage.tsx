import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Trash2 } from 'lucide-react';
import { getPatient, deletePatient, calculateAge, formatDate, type Patient } from '@/lib/data';
import PatientTabs from '@/components/PatientTabs';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id) {
        setPatient(await getPatient(id));
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 pb-6">
        <p className="text-muted-foreground text-sm">Carregando prontuário...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">Paciente não encontrado.</p>
        <button onClick={() => navigate('/pacientes')} className="text-primary font-semibold mt-4 text-sm">Voltar à lista</button>
      </div>
    );
  }

  const ageYears = calculateAge(patient.birthDate);
  const birthMs = new Date(patient.birthDate).getTime();
  const totalMonths = Math.floor((Date.now() - birthMs) / (1000 * 60 * 60 * 24 * 30.44));

  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pacientes')} className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground" style={{ lineHeight: '1.2' }}>{patient.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {ageYears} anos e {totalMonths - ageYears * 12} meses · {formatDate(patient.birthDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {patient.phone && (
            <a
              href={`tel:+55${patient.phone.replace(/\D/g, '')}`}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-success hover:bg-success/10 transition-colors active:scale-95"
            >
              <Phone size={20} />
            </a>
          )}
          <button
            onClick={async () => {
              if (!confirm('Excluir paciente e todos os dados associados?')) return;
              await deletePatient(patient.id);
              navigate('/pacientes');
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors active:scale-95"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <PatientTabs patientId={patient.id} />
    </div>
  );
}
