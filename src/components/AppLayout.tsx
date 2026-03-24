import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/pacientes', label: 'Pacientes', icon: Users },
  { path: '/relatorios', label: 'Relatórios', icon: FileText },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="app-shell">
        <header className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">EP</span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">App Clínico</p>
              <h1 className="text-lg font-bold text-foreground leading-none">Evolução Psicopedagógica</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-[0_-2px_12px_rgba(0,0,0,0.06)] z-50">
        <div className="mx-auto flex max-w-[450px] justify-around py-2">
          {navItems.map(item => {
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
