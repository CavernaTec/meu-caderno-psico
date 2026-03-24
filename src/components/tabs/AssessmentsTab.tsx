import { useEffect, useState } from 'react';
import PortageTest from '@/components/tests/PortageTest';
import IARInstrument from '@/components/tests/IARInstrument';
import EOCAChecklist from '@/components/tests/EOCAChecklist';
import AutonomyTest from '@/components/tests/AutonomyTest';
import MCHATTest from '@/components/tests/MCHATTest';
import CARSTest from '@/components/tests/CARSTest';
import { getAssessment, saveAssessment, type AssessmentData } from '@/lib/data';

const subTabs = [
  { id: 'portage', label: 'Portage' },
  { id: 'iar', label: 'IAR' },
  { id: 'eoca', label: 'EOCA' },
  { id: 'avaliar', label: 'Avaliar' },
];

export default function AssessmentsTab({ patientId }: { patientId: string }) {
  const [active, setActive] = useState('portage');
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);

  useEffect(() => {
    const load = async () => {
      setAssessment(await getAssessment(patientId));
    };
    load();
  }, [patientId]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all active:scale-[0.97] whitespace-nowrap ${
              active === t.id
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'portage' && <PortageTest patientId={patientId} />}
      {active === 'iar' && assessment && (
        <IARInstrument
          data={assessment.iarProtocol}
          onChange={async (iarProtocol) => {
            const next = { ...assessment, iarProtocol };
            setAssessment(next);
            await saveAssessment(patientId, next);
          }}
        />
      )}
      {active === 'eoca' && <EOCAChecklist patientId={patientId} />}
      {active === 'avaliar' && (
        <div className="space-y-4">
          <MCHATTest patientId={patientId} />
          <CARSTest patientId={patientId} />
          <AutonomyTest patientId={patientId} />
        </div>
      )}
    </div>
  );
}
