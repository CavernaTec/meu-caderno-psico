import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react';
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

  const whatsappUrl = `https://wa.me/55${patient.phone.replace(/\D/g, '')}`;

  return (
    <div className="container max-w-2xl py-8 px-4 md:px-0">
      <button onClick={() => navigate('/pacientes')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors active:scale-95">
        <ArrowLeft size={18} />
        <span className="text-sm font-semibold">Pacientes</span>
      </button>

      {/* Patient Header */}
      <div className="animate-fade-in mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ lineHeight: '1.2' }}>{patient.name}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {calculateAge(patient.birthDate)} anos · {patient.cid}
              </p>
            </div>
          </div>
          {patient.phone && (
            <div className="flex gap-2">
              <a href={`tel:+55${patient.phone.replace(/\D/g, '')}`} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95">
                <Phone size={18} />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success hover:opacity-80 transition-opacity active:scale-95">
                <MessageCircle size={18} />
              </a>
            </div>
          )}
        </div>
        {patient.parentNames && (
          <p className="text-muted-foreground text-sm mt-3">
            Responsáveis: {patient.parentNames}
          </p>
        )}
      </div>

      <PatientTabs patientId={patient.id} />
    </div>
  );
}
