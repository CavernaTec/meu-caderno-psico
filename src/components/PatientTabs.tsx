import { useState } from 'react';
import PTITab from './tabs/PTITab';
import EvolutionTab from './tabs/EvolutionTab';
import ABCTab from './tabs/ABCTab';

const tabs = [
  { id: 'pti', label: 'PTI' },
  { id: 'evolucao', label: 'Evolução' },
  { id: 'abc', label: 'Comportamento' },
];

export default function PatientTabs({ patientId }: { patientId: string }) {
  const [active, setActive] = useState('pti');

  return (
    <div className="animate-slide-up">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6">
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

      {/* Tab Content */}
      {active === 'pti' && <PTITab patientId={patientId} />}
      {active === 'evolucao' && <EvolutionTab patientId={patientId} />}
      {active === 'abc' && <ABCTab patientId={patientId} />}
    </div>
  );
}
