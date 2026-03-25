import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, ChevronRight, Activity, FileText, Clock, TrendingUp } from 'lucide-react';
import { getPatients, getSessions, calculateAge, type Patient } from '@/lib/data';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { startOfWeek, isAfter } from 'date-fns';

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [chartData, setChartData] = useState<{ name: string; total: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const pts = await getPatients();
      setPatients(pts);
      const sessions = await getSessions();
      const weekStart = startOfWeek(new Date());
      setSessionsThisWeek(sessions.filter(s => isAfter(new Date(s.date), weekStart)).length);
      
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const counts = new Array(12).fill(0);
      sessions.forEach(s => {
        const month = new Date(s.date).getMonth();
        counts[month]++;
      });
      setChartData(months.map((name, i) => ({ name, total: counts[i] })));
    };
    load();
  }, []);

  const recentPatients = patients.slice(-3).reverse();

  const stats = [
    { label: 'Pacientes', value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Esta Semana', value: sessionsThisWeek, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avaliações', value: 0, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="p-6 space-y-8 w-full pb-24">
      {/* Welcome Header */}
      <header className="space-y-1">
        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Olá, Profissional</h2>
        <p className="text-muted-foreground text-sm">Aqui está o resumo da sua clínica hoje.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={stat.label}
            className="bg-card p-6 rounded-[2rem] shadow-sm border border-border flex items-center gap-4"
            style={{ animation: `fadeIn 0.5s ease ${i * 100}ms both` }}
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div className="text-left">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-foreground mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions & Chart */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/pacientes/novo"
                className="w-full bg-foreground text-card p-6 rounded-[2rem] shadow-lg flex items-center justify-between group overflow-hidden relative"
              >
                <div className="relative z-10 text-left">
                  <p className="font-bold text-lg">Novo Paciente</p>
                  <p className="text-xs opacity-60">Cadastre um novo prontuário</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative z-10">
                  <Plus size={24} />
                </div>
              </Link>
              
              <Link
                to="/pacientes"
                className="w-full bg-card text-foreground p-6 rounded-[2rem] shadow-sm border border-border flex items-center justify-between group"
              >
                <div className="relative z-10 text-left">
                  <p className="font-bold text-lg">Buscar</p>
                  <p className="text-xs text-muted-foreground">Localizar paciente</p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-brand-600 relative z-10">
                  <Search size={24} />
                </div>
              </Link>
            </div>
          </section>

          {/* Chart */}
          <section className="bg-card p-6 rounded-[2rem] shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-600" />
                <h3 className="font-bold text-foreground">Evolução Mensal</h3>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessões</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#0ea5e9' : '#f1f5f9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Recent Patients */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold uppercase text-xs tracking-widest text-muted-foreground">Pacientes Recentes</h3>
              <ChevronRight size={18} className="text-muted-foreground/50" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {recentPatients.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/pacientes/${p.id}`}
                  className="w-full bg-card p-4 rounded-2xl flex items-center justify-between hover:border-brand-500 hover:shadow-md transition-all group border border-border"
                  style={{ animation: `fadeIn 0.5s ease ${(i + 4) * 100}ms both` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground font-bold group-hover:bg-accent group-hover:text-brand-600 transition-colors">
                      {p.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground text-sm">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {calculateAge(p.birthDate)} anos • {p.cid || 'Sem CID'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground/50 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
              {recentPatients.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm font-medium">Nenhum paciente cadastrado ainda.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
