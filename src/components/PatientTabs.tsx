import { useState } from 'react';
import { User, Activity, ClipboardCheck, Brain, Heart, Target, History } from 'lucide-react';
import CadastroTab from './tabs/CadastroTab';
import AssessmentsTab from './tabs/AssessmentsTab';
import PTITab from './tabs/PTITab';
import EvolutionTab from './tabs/EvolutionTab';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'cadastro', label: 'Cadastro', icon: User, color: 'text-blue-600' },
  { id: 'avaliacoes', label: 'Avaliações', icon: ClipboardCheck, color: 'text-amber-600' },
  { id: 'pti', label: 'PTI', icon: Target, color: 'text-orange-600' },
  { id: 'evolucao', label: 'Evolução', icon: History, color: 'text-indigo-600' },
];

export default function PatientTabs({ patientId }: { patientId: string }) {
  const [active, setActive] = useState('cadastro');

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-card p-1.5 rounded-2xl border border-border shadow-sm mb-6 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex items-center gap-1.5 flex-shrink-0 px-3 py-2.5 text-xs font-bold rounded-xl transition-all active:scale-[0.97]",
              active === tab.id
                ? "bg-brand-600 text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'cadastro' && <CadastroTab patientId={patientId} />}
      {active === 'avaliacoes' && <AssessmentsTab patientId={patientId} />}
      {active === 'pti' && <PTITab patientId={patientId} />}
      {active === 'evolucao' && <EvolutionTab patientId={patientId} />}
    </div>
  );
}
