import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/pacientes', label: 'Pacientes', icon: Users },
  { path: '/relatorios', label: 'Relatórios', icon: FileText },
  { path: '/ajustes', label: 'Ajustes', icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 z-50">
        <div className="p-8">
          <h1 className="text-2xl font-display font-black text-brand-600 uppercase tracking-tighter">PsicoApp</h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Caderno Avançado</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all",
                  active
                    ? "bg-accent text-brand-600 shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        <div className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto w-full h-full">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card/90 backdrop-blur-md border-t border-border flex justify-around items-center h-16 pb-safe z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all flex-1 py-2",
                  active ? "text-brand-600" : "text-muted-foreground"
                )}
              >
                <item.icon size={20} className={cn(active && "scale-110")} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                {active && (
                  <div className="w-1 h-1 bg-brand-600 rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
