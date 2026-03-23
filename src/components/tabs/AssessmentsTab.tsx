import { useState, useEffect } from 'react';
import { Save, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getAssessment, saveAssessment,
  type AssessmentData, type WritingLevel,
} from '@/lib/data';
import IARInstrument from '@/components/tests/IARInstrument';

const INSTRUMENT_FIELDS: { key: keyof AssessmentData['instruments']; label: string }[] = [
  { key: 'eoca', label: 'EOCA' },
  { key: 'provasOperatorias', label: 'Provas Operatórias' },
  { key: 'tecnicasProjetivas', label: 'Técnicas Projetivas' },
  { key: 'anamnese', label: 'Anamnese' },
  { key: 'cars2', label: 'CARS-2' },
  { key: 'mchatR', label: 'M-CHAT-R' },
  { key: 'proteaR', label: 'PROTEA-R' },
];

const WRITING_LEVELS: { value: WritingLevel; label: string }[] = [
  { value: 'pre_silabico', label: 'Pré-silábico' },
  { value: 'silabico', label: 'Silábico' },
  { value: 'silabico_alfabetico', label: 'Silábico-Alfabético' },
  { value: 'alfabetico', label: 'Alfabético' },
];

export default function AssessmentsTab({ patientId }: { patientId: string }) {
  const [data, setData] = useState<AssessmentData>(() => getAssessment(patientId));

  useEffect(() => {
    setData(getAssessment(patientId));
  }, [patientId]);

  function handleSave() {
    saveAssessment(patientId, data);
    toast.success('Avaliação salva com sucesso!');
  }

  function updateInstrument(key: keyof AssessmentData['instruments'], field: 'applied' | 'result', value: any) {
    setData(prev => ({
      ...prev,
      instruments: {
        ...prev.instruments,
        [key]: { ...prev.instruments[key], [field]: value },
      },
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Avaliações e Sondagens</h3>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
        >
          <Save size={16} />
          Salvar Avaliação
        </button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {/* IAR */}
        <AccordionItem value="iar" className="border rounded-xl px-4 bg-card shadow-sm">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            IAR — Instrumento de Avaliação do Repertório Básico
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-2">
              <IARInstrument
                data={data.iarProtocol}
                onChange={(iarProtocol) => setData(prev => ({ ...prev, iarProtocol }))}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Instruments */}
        <AccordionItem value="instruments" className="border rounded-xl px-4 bg-card shadow-sm">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Instrumentos e Testes Aplicados
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pb-2">
              {INSTRUMENT_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={data.instruments[key].applied}
                      onCheckedChange={(v) => updateInstrument(key, 'applied', !!v)}
                      id={`inst-${key}`}
                    />
                    <label htmlFor={`inst-${key}`} className="text-sm font-medium cursor-pointer">
                      {label}
                    </label>
                  </div>
                  {data.instruments[key].applied && (
                    <Input
                      placeholder="Resultado / observações"
                      value={data.instruments[key].result}
                      onChange={(e) => updateInstrument(key, 'result', e.target.value)}
                      className="text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Probes */}
        <AccordionItem value="probes" className="border rounded-xl px-4 bg-card shadow-sm">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Sondagens Pedagógicas
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pb-2">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Sondagem de Escrita</p>
                <div className="flex flex-wrap gap-2">
                  {WRITING_LEVELS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setData(prev => ({
                        ...prev,
                        probes: { ...prev.probes, writingLevel: prev.probes.writingLevel === opt.value ? '' : opt.value },
                      }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                        data.probes.writingLevel === opt.value
                          ? 'bg-primary/15 text-primary border-primary/30'
                          : 'bg-muted text-muted-foreground border-transparent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Sondagem Matemática</p>
                <Textarea
                  placeholder="Descreva os resultados da sondagem matemática..."
                  value={data.probes.mathNotes}
                  onChange={(e) => setData(prev => ({ ...prev, probes: { ...prev.probes, mathNotes: e.target.value } }))}
                  className="text-sm min-h-[80px]"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Avaliação Psicomotora</p>
                <Textarea
                  placeholder="Descreva os resultados da avaliação psicomotora..."
                  value={data.probes.psychomotorNotes}
                  onChange={(e) => setData(prev => ({ ...prev, probes: { ...prev.probes, psychomotorNotes: e.target.value } }))}
                  className="text-sm min-h-[80px]"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Diagnostic Hypothesis */}
        <AccordionItem value="diagnosis" className="border rounded-xl px-4 bg-card shadow-sm">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Hipótese Diagnóstica
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              placeholder="Registre aqui a conclusão clínica após as avaliações..."
              value={data.diagnosticHypothesis}
              onChange={(e) => setData(prev => ({ ...prev, diagnosticHypothesis: e.target.value }))}
              className="text-sm min-h-[120px]"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
