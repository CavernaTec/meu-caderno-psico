import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Clock, CheckCircle2 } from 'lucide-react';
import { getTodaySessions, getPatient, type Session, type Patient, updateSession } from '@/lib/data';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomePage() {
  const [sessions, setSessions] = useState<(Session & { patient?: Patient })[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  function loadSessions() {
    const todaySessions = getTodaySessions()
      .map(s => ({ ...s, patient: getPatient(s.patientId) }))
      .sort((a, b) => a.time.localeCompare(b.time));
    setSessions(todaySessions);
  }

  function handleStartSession(session: Session & { patient?: Patient }) {
    if (!session.completed) {
      updateSession(session.id, { completed: true });
      loadSessions();
    }
    navigate(`/pacientes/${session.patientId}`);
  }

  return (
    <div className="container max-w-2xl py-8 px-4 md:px-0">
      {/* Greeting */}
      <div className="animate-fade-in mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight" style={{ lineHeight: '1.2' }}>
          Olá, Daniele. {getGreeting()}! 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          Aqui está sua agenda de hoje.
        </p>
      </div>

      {/* Today's Agenda */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="animate-slide-up bg-card rounded-2xl p-8 text-center shadow-sm border">
            <p className="text-muted-foreground text-lg font-medium">Nenhuma sessão agendada para hoje.</p>
            <p className="text-muted-foreground text-sm mt-1">Use o botão + para cadastrar um paciente.</p>
          </div>
        ) : (
          sessions.map((session, i) => (
            <div
              key={session.id}
              className="bg-card rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow duration-300 cursor-pointer active:scale-[0.98]"
              style={{ animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms both` }}
              onClick={() => handleStartSession(session)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                    session.completed ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                  }`}>
                    {session.patient?.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{session.patient?.name}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-0.5">
                      <Clock size={14} />
                      <span>{session.time}</span>
                      {session.completed && (
                        <span className="flex items-center gap-1 text-success ml-2">
                          <CheckCircle2 size={14} />
                          Concluída
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!session.completed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartSession(session);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
                  >
                    <Play size={14} />
                    <span className="hidden sm:inline">Iniciar</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <Link
        to="/pacientes/novo"
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 z-40"
        aria-label="Cadastrar novo paciente"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}
