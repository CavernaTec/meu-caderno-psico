import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarDays, Plus, FileText, Brain, ArrowRight } from 'lucide-react';
import { getPatients, getSessions } from '@/lib/data';

function formatLongDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date);
  return formatted.replace(/\b\w/g, char => char.toUpperCase());
}

function countRecentSessions(days = 7): number {
  const limit = new Date();
  limit.setDate(limit.getDate() - days);
  return getSessions().filter(session => new Date(session.date) >= limit).length;
}

export default function HomePage() {
  const [patientsCount, setPatientsCount] = useState(0);
  const [recentSessionsCount, setRecentSessionsCount] = useState(0);

  useEffect(() => {
    setPatientsCount(getPatients().length);
    setRecentSessionsCount(countRecentSessions(7));
  }, []);

  return (
    <div className="container max-w-2xl py-8 px-4 md:px-0">
      <div className="animate-fade-in">
        <p className="text-sm text-muted-foreground">{formatLongDate(new Date())}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2" style={{ lineHeight: '1.15' }}>
          Psicopedagogia
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Gestão psicopedagógica de crianças autistas
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-7">
        <div className="bg-[#eef5ff] border border-[#dfe9ff] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#3b6eea] font-semibold text-sm">
            <Users size={18} />
            pacientes
          </div>
          <div className="mt-4 h-1 w-8 rounded-full bg-[#3b6eea]" />
          <p className="mt-3 text-[#3b6eea] text-sm">{patientsCount} cadastrados</p>
        </div>
        <div className="bg-[#effbf2] border border-[#d9f3e3] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#2b8a4b] font-semibold text-sm">
            <CalendarDays size={18} />
            Sessões
          </div>
          <div className="mt-4 h-1 w-8 rounded-full bg-[#2b8a4b]" />
          <p className="mt-3 text-[#2b8a4b] text-sm">{recentSessionsCount} recentes</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Acesso Q</h2>
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
            <ArrowRight size={18} className="opacity-80" />
          </Link>

          <Link
            to="/pacientes"
            className="flex items-center justify-between bg-card rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#eef5ff] flex items-center justify-center text-[#3b6eea]">
                <Users size={22} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Ver Pacientes</p>
                <p className="text-sm text-muted-foreground">Lista completa</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-muted-foreground" />
          </Link>

          <Link
            to="/relatorios"
            className="flex items-center justify-between bg-card rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f1edff] flex items-center justify-center text-[#7a5ae6]">
                <FileText size={22} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Relatórios</p>
                <p className="text-sm text-muted-foreground">Gerar relatório profissional</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-muted-foreground" />
          </Link>
        </div>
      </div>

      {patientsCount === 0 && (
        <div className="mt-10 text-center text-muted-foreground">
          <Brain size={44} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">nenhum paciente cadastrado</p>
        </div>
      )}
    </div>
  );
}
