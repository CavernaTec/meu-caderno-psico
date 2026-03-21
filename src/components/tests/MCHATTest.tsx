import { useState, useEffect, useMemo } from 'react';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  MCHAT_QUESTIONS, getMCHATData, saveMCHATData, calculateMCHATResult,
  type MCHATData,
} from '@/lib/testsData';

export default function MCHATTest({ patientId }: { patientId: string }) {
  const [data, setData] = useState<MCHATData>(() => getMCHATData(patientId));

  useEffect(() => { setData(getMCHATData(patientId)); }, [patientId]);

  const result = useMemo(() => calculateMCHATResult(data), [data]);

  function setAnswer(id: string, value: boolean) {
    setData(prev => ({ ...prev, answers: { ...prev.answers, [id]: value } }));
  }

  function handleSave() {
    saveMCHATData(patientId, data);
    toast.success('M-CHAT-R salvo com sucesso!');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-foreground">M-CHAT-R (Rastreio TEA)</h3>
        <button onClick={handleSave} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
          <Save size={16} />
          Salvar
        </button>
      </div>

      {/* Result banner */}
      {result.answered >= 20 && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          result.risk
            ? 'bg-destructive/10 border-destructive/30 text-destructive'
            : 'bg-success/10 border-success/30 text-success'
        }`}>
          {result.risk ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          <div>
            <p className="text-sm font-bold">
              {result.risk ? '⚠️ RISCO PARA TEA' : '✅ Sem Risco Identificado'}
            </p>
            <p className="text-xs">
              {result.totalFails} falha(s) total | {result.criticalFails} falha(s) em itens críticos
              {result.risk && ' — Recomenda-se encaminhamento para avaliação especializada.'}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{result.answered} de {result.total} perguntas respondidas</p>

      <div className="space-y-2">
        {MCHAT_QUESTIONS.map((q, i) => (
          <div key={q.id} className={`bg-card border rounded-xl p-3 shadow-sm ${q.critical ? 'border-l-4 border-l-accent' : ''}`}>
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">{i + 1}.</span>
              <div className="flex-1">
                <p className="text-xs text-foreground leading-relaxed">
                  {q.text}
                  {q.critical && <span className="ml-1 text-[10px] text-accent font-semibold">(Crítico)</span>}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setAnswer(q.id, true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                      data.answers[q.id] === true
                        ? 'bg-success/15 text-success border-success/30'
                        : 'bg-muted text-muted-foreground border-transparent'
                    }`}
                  >
                    SIM
                  </button>
                  <button
                    onClick={() => setAnswer(q.id, false)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                      data.answers[q.id] === false
                        ? 'bg-destructive/15 text-destructive border-destructive/30'
                        : 'bg-muted text-muted-foreground border-transparent'
                    }`}
                  >
                    NÃO
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
