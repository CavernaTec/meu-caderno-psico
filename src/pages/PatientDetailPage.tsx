import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { getPatient, calculateAge, formatDate, type Patient } from '@/lib/data';
import PatientTabs from '@/components/PatientTabs';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | undefined>();

  useEffect(() => {
    if (id) setPatient(getPatient(id));
  }, [id]);

  if (!patient) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <p className="text-muted-foreground text-lg">Paciente não encontrado.</p>
        <button onClick={() => navigate('/pacientes')} className="text-primary font-semibold mt-4 text-sm">Voltar à lista</button>
      </div>
    );
  }

  const ageYears = calculateAge(patient.birthDate);
  const birthMs = new Date(patient.birthDate).getTime();
  const totalMonths = Math.floor((Date.now() - birthMs) / (1000 * 60 * 60 * 24 * 30.44));

  return (
    <div className="container max-w-2xl py-8 px-4 md:px-0">
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
        {patient.phone && (
          <a
            href={`tel:+55${patient.phone.replace(/\D/g, '')}`}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-success hover:bg-success/10 transition-colors active:scale-95"
          >
            <Phone size={20} />
          </a>
        )}
      </div>

      <PatientTabs patientId={patient.id} />
    </div>
  );
}
