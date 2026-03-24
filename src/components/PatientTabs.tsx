import { useState } from 'react';
import CadastroTab from './tabs/CadastroTab';
import AssessmentsTab from './tabs/AssessmentsTab';
import PTITab from './tabs/PTITab';
import EvolutionTab from './tabs/EvolutionTab';

const tabs = [
  { id: 'cadastro', label: 'Cadastro' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'pti', label: 'PTI' },
  { id: 'evolucao', label: 'Evolução' },
];

export default function PatientTabs({ patientId }: { patientId: string }) {
  const [active, setActive] = useState('cadastro');

  return (
    <div className="animate-slide-up">
      <div className="flex bg-muted p-1 rounded-xl mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] ${
              active === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
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
