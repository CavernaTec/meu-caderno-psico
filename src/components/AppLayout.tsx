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
    <div className="min-h-screen flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-card border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">EP</span>
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">Evolução Psicopedagógica</span>
        </div>
        <nav className="flex gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-[0_-2px_12px_rgba(0,0,0,0.06)] z-50">
        <div className="flex justify-around py-2">
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
