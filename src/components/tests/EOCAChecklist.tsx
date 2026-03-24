import { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  EOCA_TEMATICA, EOCA_DINAMICA, EOCA_PRODUTO, EOCA_MODALIDADES,
  getEOCAData, saveEOCAData, type EOCAData,
} from '@/lib/testsData';

export default function EOCAChecklist({ patientId }: { patientId: string }) {
  const [data, setData] = useState<EOCAData>({ tematica: {}, dinamica: {}, produto: {}, modalidade: '', observacoes: '', conclusao: '' });

  useEffect(() => {
    const load = async () => {
      setData(await getEOCAData(patientId));
    };
    load();
  }, [patientId]);

  function toggleCheck(section: 'tematica' | 'dinamica' | 'produto', id: string) {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [id]: !prev[section][id] },
    }));
  }

  async function handleSave() {
    await saveEOCAData(patientId, data);
    toast.success('EOCA salva com sucesso!');
  }

  const sections = [
    { key: 'tematica' as const, label: 'Temática', items: EOCA_TEMATICA },
    { key: 'dinamica' as const, label: 'Dinâmica', items: EOCA_DINAMICA },
    { key: 'produto' as const, label: 'Produto', items: EOCA_PRODUTO },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-accent" />
          <h3 className="font-semibold text-foreground">Checklist EOCA</h3>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <Save size={16} />
          Salvar
        </button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {sections.map(sec => (
          <AccordionItem key={sec.key} value={sec.key} className="border rounded-xl px-4 bg-card shadow-sm">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">{sec.label}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {sec.items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                    <Checkbox
                      checked={!!data[sec.key][item.id]}
                      onCheckedChange={() => toggleCheck(sec.key, item.id)}
                      id={`eoca-${item.id}`}
                    />
                    <label htmlFor={`eoca-${item.id}`} className="text-xs cursor-pointer leading-relaxed">
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="modalidade" className="border rounded-xl px-4 bg-card shadow-sm">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Modalidade de Aprendizagem
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pb-2">
              {EOCA_MODALIDADES.map(mod => (
                <button
                  key={mod.value}
                  onClick={() => setData(prev => ({ ...prev, modalidade: prev.modalidade === mod.value ? '' : mod.value }))}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    data.modalidade === mod.value
                      ? 'bg-accent/10 border-accent/30 text-accent-foreground'
                      : 'bg-muted/30 border-transparent text-foreground'
                  }`}
                >
                  <p className="text-xs font-semibold">{mod.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{mod.desc}</p>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="conclusao" className="border rounded-xl px-4 bg-card shadow-sm">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Resultado Final / Conclusão</AccordionTrigger>
          <AccordionContent>
            <Textarea
              placeholder="Conclusão da EOCA — síntese dos achados..."
              value={data.conclusao || ''}
              onChange={e => setData(prev => ({ ...prev, conclusao: e.target.value }))}
              className="text-sm min-h-[100px] mb-3"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="obs" className="border rounded-xl px-4 bg-card shadow-sm">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Observações e Encaminhamentos</AccordionTrigger>
          <AccordionContent>
            <Textarea
              placeholder="Observações gerais e encaminhamentos..."
              value={data.observacoes}
              onChange={e => setData(prev => ({ ...prev, observacoes: e.target.value }))}
              className="text-sm min-h-[80px]"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
