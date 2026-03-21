import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import PortageTest from './PortageTest';
import EOCAChecklist from './EOCAChecklist';
import AutonomyTest from './AutonomyTest';
import MCHATTest from './MCHATTest';
import CARSTest from './CARSTest';

const tests = [
  { id: 'portage', label: 'Portage' },
  { id: 'eoca', label: 'EOCA' },
  { id: 'autonomia', label: 'Autonomia' },
  { id: 'mchat', label: 'M-CHAT-R' },
  { id: 'cars', label: 'CARS' },
];

export default function TestsHub({ patientId }: { patientId: string }) {
  const [active, setActive] = useState('portage');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList size={20} className="text-primary" />
        <h3 className="font-semibold text-foreground">Testes Interativos</h3>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto">
        {tests.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg transition-all active:scale-[0.97] ${
              active === t.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'portage' && <PortageTest patientId={patientId} />}
      {active === 'eoca' && <EOCAChecklist patientId={patientId} />}
      {active === 'autonomia' && <AutonomyTest patientId={patientId} />}
      {active === 'mchat' && <MCHATTest patientId={patientId} />}
      {active === 'cars' && <CARSTest patientId={patientId} />}
    </div>
  );
}
