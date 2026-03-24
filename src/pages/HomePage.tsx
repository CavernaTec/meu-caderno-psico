import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarDays, Plus, FileText, ArrowRight } from 'lucide-react';
import { getPatients, getSessions } from '@/lib/data';

function formatLongDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date);
  return formatted.replace(/^\w/, c => c.toUpperCase()).replace(/-feira/, '-Feira').replace(/de (\w)/, (_, c) => `De ${c.toUpperCase()}`);
}

async function countRecentSessions(days = 7): Promise<number> {
  const limit = new Date();
  limit.setDate(limit.getDate() - days);
  const sessions = await getSessions();
  return sessions.filter(session => new Date(session.date) >= limit).length;
}

export default function HomePage() {
  const [patientsCount, setPatientsCount] = useState(0);
  const [recentSessionsCount, setRecentSessionsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const patients = await getPatients();
      setPatientsCount(patients.length);
      setRecentSessionsCount(await countRecentSessions(7));
    };
    load();
  }, []);

  return (
    <div className="px-4 pb-6">
      <div className="animate-fade-in">
        <p className="text-sm text-primary font-medium">{formatLongDate(new Date())}</p>
        <h1 className="text-3xl font-bold text-foreground mt-1">Psicopedagogia</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gestão psicopedagógica de crianças autistas
        </p>
      </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-card border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Users size={18} />
              Pacientes
            </div>
            <p className="text-3xl font-bold text-primary mt-2">{patientsCount}</p>
            <p className="text-sm text-muted-foreground">cadastrados</p>
          </div>
          <div className="bg-card border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-success font-semibold text-sm">
              <CalendarDays size={18} />
              Sessões
            </div>
          <p className="text-3xl font-bold text-foreground mt-2">{recentSessionsCount}</p>
          <p className="text-sm text-muted-foreground">recentes</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Acesso Rápido</h2>
        <div className="mt-4 space-y-3">
          <Link
            to="/pacientes/novo"
            className="flex items-center justify-between bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg shadow-primary/20 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
                <Plus size={24} />
              </div>
              <div>
                <p className="font-semibold">Novo Paciente</p>
                <p className="text-sm opacity-90">Cadastrar nova criança</p>
              </div>
            </div>
          </Link>

          <Link
            to="/pacientes"
            className="flex items-center justify-between bg-card rounded-2xl p-4 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <Users size={22} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Ver Pacientes</p>
                <p className="text-sm text-muted-foreground">Lista completa</p>
              </div>
            </div>
          </Link>

          <Link
            to="/relatorios"
            className="flex items-center justify-between bg-card rounded-2xl p-4 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <FileText size={22} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Relatórios</p>
                <p className="text-sm text-muted-foreground">Gerar relatório profissional</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
