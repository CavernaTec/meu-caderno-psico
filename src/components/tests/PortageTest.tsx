import { useState, useEffect, useMemo } from 'react';
import { Save, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  PORTAGE_AREAS, getPortageData, savePortageData, calculatePortageResults,
  type PortageData, type PortageAnswer,
} from '@/lib/testsData';
import { calculateAge, getPatient } from '@/lib/data';

const ANSWER_OPTIONS: { value: PortageAnswer; label: string; color: string }[] = [
  { value: 1, label: 'SIM', color: 'bg-success/15 text-success border-success/30' },
  { value: 0.5, label: 'ÀS VEZES', color: 'bg-primary/15 text-primary border-primary/30' },
  { value: 0, label: 'NÃO', color: 'bg-destructive/15 text-destructive border-destructive/30' },
];

const AGE_RANGES = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6'];

export default function PortageTest({ patientId }: { patientId: string }) {
  const [data, setData] = useState<PortageData>(() => getPortageData(patientId));
  const [showChart, setShowChart] = useState(false);

  useEffect(() => { setData(getPortageData(patientId)); }, [patientId]);

  const patient = getPatient(patientId);
  const realAgeMonths = patient ? calculateAge(patient.birthDate) * 12 : 0;

  const results = useMemo(() => calculatePortageResults(data), [data]);

  const chartData = useMemo(() =>
    PORTAGE_AREAS.map(area => ({
      area: area.label,
      'Idade Real (meses)': realAgeMonths,
      'Idade Desenvolvimento (meses)': results[area.key]?.devAge || 0,
    })),
    [results, realAgeMonths]
  );

  function setAnswer(itemId: string, value: PortageAnswer) {
    setData(prev => ({
      ...prev,
      answers: { ...prev.answers, [itemId]: prev.answers[itemId] === value ? undefined as any : value },
    }));
  }

  function handleSave() {
    savePortageData(patientId, { ...data, completedAt: new Date().toISOString() });
    toast.success('Escala Portage salva com sucesso!');
  }

  const answeredCount = Object.keys(data.answers).filter(k => data.answers[k] !== undefined).length;
  const totalItems = PORTAGE_AREAS.reduce((acc, a) => acc + Object.values(a.items).flat().length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-foreground">Escala Portage</h3>
          <p className="text-xs text-muted-foreground">{answeredCount} de {totalItems} itens respondidos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-1.5 border border-primary/30 text-primary px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors"
          >
            <BarChart3 size={16} />
            {showChart ? 'Ocultar Gráfico' : 'Ver Gráfico'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>

      {showChart && (
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold mb-3">Perfil de Desenvolvimento</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" tick={{ fontSize: 10 }} />
              <YAxis label={{ value: 'Meses', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Idade Real (meses)" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Idade Desenvolvimento (meses)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Result Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
            {PORTAGE_AREAS.map(area => {
              const r = results[area.key];
              const diff = r ? r.devAge - realAgeMonths : 0;
              return (
                <div key={area.key} className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">{area.label}</p>
                  <p className="text-lg font-bold text-primary">{r?.devAge || 0}m</p>
                  <p className="text-[10px] text-muted-foreground">{r?.percentage || 0}%</p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${diff >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}m
                  </p>
                </div>
              );
            })}
          </div>

          {/* Summary Card */}
          <div className="mt-4 p-3 rounded-xl border bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Idade Cronológica</span>
              <span className="font-bold text-primary">{realAgeMonths} meses</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="font-semibold text-foreground">Média I.D.</span>
              <span className="font-bold text-primary">
                {(() => {
                  const vals = PORTAGE_AREAS.map(a => results[a.key]?.devAge || 0);
                  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
                  return avg.toFixed(1);
                })()} meses
              </span>
            </div>
          </div>
        </div>
      )}

      <Accordion type="single" collapsible className="space-y-2">
        {PORTAGE_AREAS.map(area => (
          <AccordionItem key={area.key} value={area.key} className="border rounded-xl px-4 bg-card shadow-sm">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                {area.label}
                <span className="text-xs text-muted-foreground font-normal">
                  ({Object.values(area.items).flat().filter(i => data.answers[i.id] !== undefined).length}/{Object.values(area.items).flat().length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible className="space-y-1">
                {AGE_RANGES.map(range => {
                  const items = area.items[range];
                  if (!items || items.length === 0) return null;
                  return (
                    <AccordionItem key={range} value={range} className="border-none">
                      <AccordionTrigger className="text-xs font-medium py-2 hover:no-underline text-muted-foreground">
                        Faixa {range} anos
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2">
                          {items.map(item => (
                            <div key={item.id} className="p-2 rounded-lg bg-muted/30">
                              <p className="text-xs text-foreground mb-2">{item.text}</p>
                              <div className="flex gap-1.5">
                                {ANSWER_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => setAnswer(item.id, opt.value)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all active:scale-95 ${
                                      data.answers[item.id] === opt.value ? opt.color : 'bg-muted text-muted-foreground border-transparent'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
