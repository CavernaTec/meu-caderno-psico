import { useState } from 'react';
import SessionsTab from './tabs/SessionsTab';
import PTITab from './tabs/PTITab';
import EvolutionTab from './tabs/EvolutionTab';
import ABCTab from './tabs/ABCTab';
import MediaTab from './tabs/MediaTab';
import AssessmentsTab from './tabs/AssessmentsTab';

const tabs = [
  { id: 'sessoes', label: 'Sessões' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'pti', label: 'PTI' },
  { id: 'evolucao', label: 'Evolução' },
  { id: 'abc', label: 'ABC' },
  { id: 'media', label: 'Mídia' },
];

export default function PatientTabs({ patientId }: { patientId: string }) {
  const [active, setActive] = useState('sessoes');

  return (
    <div className="animate-slide-up">
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

      {active === 'sessoes' && <SessionsTab patientId={patientId} />}
      {active === 'avaliacoes' && <AssessmentsTab patientId={patientId} />}
      {active === 'pti' && <PTITab patientId={patientId} />}
      {active === 'evolucao' && <EvolutionTab patientId={patientId} />}
      {active === 'abc' && <ABCTab patientId={patientId} />}
      {active === 'media' && <MediaTab patientId={patientId} />}
    </div>
  );
}
