export type IARProtocolScore = 0 | 0.5 | 1;

export type IARAreaKey =
  | 'cores'
  | 'esquemaCorporal'
  | 'lateralidade'
  | 'posicao'
  | 'discriminacaoVisual'
  | 'discriminacaoAuditiva'
  | 'analiseSintese';

export type IARVisualConfig =
  | { type: 'cores'; highlight: string }
  | { type: 'corpo'; focus: 'cabeca' | 'olhos' | 'boca' | 'ombro' | 'joelho' }
  | { type: 'lateralidade'; target: 'direita' | 'esquerda' }
  | { type: 'posicao'; relation: 'em_cima' | 'embaixo' | 'dentro' | 'ao_lado' | 'frente' | 'atras' }
  | { type: 'visual'; task: 'igual' | 'diferente' | 'maior' | 'menor' | 'forma' }
  | { type: 'auditiva'; pair: string; rhyme?: string }
  | { type: 'analise'; missing: 'triangulo' | 'circulo' | 'quadrado' };

export interface IARProtocolItem {
  id: string;
  area: IARAreaKey;
  title: string;
  instruction: string;
  visual: IARVisualConfig;
}

export const IAR_AREA_LABELS: Record<IARAreaKey, string> = {
  cores: 'Cores',
  esquemaCorporal: 'Esquema Corporal',
  lateralidade: 'Lateralidade',
  posicao: 'Posição',
  discriminacaoVisual: 'Discriminação Visual',
  discriminacaoAuditiva: 'Discriminação Auditiva',
  analiseSintese: 'Análise-Síntese',
};

export const IAR_PROTOCOL_STEPS: IARProtocolItem[] = [
  {
    id: 'cores_vermelho',
    area: 'cores',
    title: 'Cores — Vermelho',
    instruction: 'Aponte para a cor vermelha.',
    visual: { type: 'cores', highlight: 'vermelho' },
  },
  {
    id: 'cores_azul',
    area: 'cores',
    title: 'Cores — Azul',
    instruction: 'Aponte para a cor azul.',
    visual: { type: 'cores', highlight: 'azul' },
  },
  {
    id: 'cores_amarelo',
    area: 'cores',
    title: 'Cores — Amarelo',
    instruction: 'Aponte para a cor amarela.',
    visual: { type: 'cores', highlight: 'amarelo' },
  },
  {
    id: 'cores_verde',
    area: 'cores',
    title: 'Cores — Verde',
    instruction: 'Aponte para a cor verde.',
    visual: { type: 'cores', highlight: 'verde' },
  },
  {
    id: 'cores_preto',
    area: 'cores',
    title: 'Cores — Preto',
    instruction: 'Aponte para a cor preta.',
    visual: { type: 'cores', highlight: 'preto' },
  },
  {
    id: 'cores_branco',
    area: 'cores',
    title: 'Cores — Branco',
    instruction: 'Aponte para a cor branca.',
    visual: { type: 'cores', highlight: 'branco' },
  },
  {
    id: 'corpo_cabeca',
    area: 'esquemaCorporal',
    title: 'Esquema Corporal — Cabeça',
    instruction: 'Toque a cabeça.',
    visual: { type: 'corpo', focus: 'cabeca' },
  },
  {
    id: 'corpo_olhos',
    area: 'esquemaCorporal',
    title: 'Esquema Corporal — Olhos',
    instruction: 'Mostre os olhos.',
    visual: { type: 'corpo', focus: 'olhos' },
  },
  {
    id: 'corpo_boca',
    area: 'esquemaCorporal',
    title: 'Esquema Corporal — Boca',
    instruction: 'Toque a boca.',
    visual: { type: 'corpo', focus: 'boca' },
  },
  {
    id: 'corpo_ombro',
    area: 'esquemaCorporal',
    title: 'Esquema Corporal — Ombro',
    instruction: 'Toque o ombro.',
    visual: { type: 'corpo', focus: 'ombro' },
  },
  {
    id: 'corpo_joelho',
    area: 'esquemaCorporal',
    title: 'Esquema Corporal — Joelho',
    instruction: 'Toque o joelho.',
    visual: { type: 'corpo', focus: 'joelho' },
  },
  {
    id: 'lateralidade_direita',
    area: 'lateralidade',
    title: 'Lateralidade — Direita',
    instruction: 'Aponte para a árvore que está à direita.',
    visual: { type: 'lateralidade', target: 'direita' },
  },
  {
    id: 'lateralidade_esquerda',
    area: 'lateralidade',
    title: 'Lateralidade — Esquerda',
    instruction: 'Aponte para a casa que está à esquerda.',
    visual: { type: 'lateralidade', target: 'esquerda' },
  },
  {
    id: 'lateralidade_cor',
    area: 'lateralidade',
    title: 'Lateralidade — Referência',
    instruction: 'Qual objeto está à direita do sol?',
    visual: { type: 'lateralidade', target: 'direita' },
  },
  {
    id: 'posicao_em_cima',
    area: 'posicao',
    title: 'Posição — Em cima',
    instruction: 'Aponte o gato que está em cima da mesa.',
    visual: { type: 'posicao', relation: 'em_cima' },
  },
  {
    id: 'posicao_embaixo',
    area: 'posicao',
    title: 'Posição — Embaixo',
    instruction: 'Aponte a bola que está embaixo da cadeira.',
    visual: { type: 'posicao', relation: 'embaixo' },
  },
  {
    id: 'posicao_dentro',
    area: 'posicao',
    title: 'Posição — Dentro',
    instruction: 'Aponte o lápis que está dentro da caixa.',
    visual: { type: 'posicao', relation: 'dentro' },
  },
  {
    id: 'posicao_ao_lado',
    area: 'posicao',
    title: 'Posição — Ao lado',
    instruction: 'Aponte o brinquedo que está ao lado do cubo.',
    visual: { type: 'posicao', relation: 'ao_lado' },
  },
  {
    id: 'posicao_frente',
    area: 'posicao',
    title: 'Posição — Em frente',
    instruction: 'Aponte o cachorro que está na frente da casa.',
    visual: { type: 'posicao', relation: 'frente' },
  },
  {
    id: 'posicao_atras',
    area: 'posicao',
    title: 'Posição — Atrás',
    instruction: 'Aponte a bicicleta que está atrás da árvore.',
    visual: { type: 'posicao', relation: 'atras' },
  },
  {
    id: 'visual_igual',
    area: 'discriminacaoVisual',
    title: 'Discriminação Visual — Igual',
    instruction: 'Aponte para as figuras que são iguais.',
    visual: { type: 'visual', task: 'igual' },
  },
  {
    id: 'visual_diferente',
    area: 'discriminacaoVisual',
    title: 'Discriminação Visual — Diferente',
    instruction: 'Aponte para a figura que é diferente.',
    visual: { type: 'visual', task: 'diferente' },
  },
  {
    id: 'visual_maior',
    area: 'discriminacaoVisual',
    title: 'Discriminação Visual — Maior',
    instruction: 'Aponte para o objeto maior.',
    visual: { type: 'visual', task: 'maior' },
  },
  {
    id: 'visual_menor',
    area: 'discriminacaoVisual',
    title: 'Discriminação Visual — Menor',
    instruction: 'Aponte para o objeto menor.',
    visual: { type: 'visual', task: 'menor' },
  },
  {
    id: 'visual_forma',
    area: 'discriminacaoVisual',
    title: 'Discriminação Visual — Formas',
    instruction: 'Aponte para o triângulo.',
    visual: { type: 'visual', task: 'forma' },
  },
  {
    id: 'auditiva_faca_vaca',
    area: 'discriminacaoAuditiva',
    title: 'Discriminação Auditiva — Palavra',
    instruction: 'Repita: “faca” e “vaca”.',
    visual: { type: 'auditiva', pair: 'Faca / Vaca' },
  },
  {
    id: 'auditiva_pao_bom',
    area: 'discriminacaoAuditiva',
    title: 'Discriminação Auditiva — Palavra',
    instruction: 'Repita: “pão” e “bom”.',
    visual: { type: 'auditiva', pair: 'Pão / Bom' },
  },
  {
    id: 'auditiva_rima',
    area: 'discriminacaoAuditiva',
    title: 'Discriminação Auditiva — Rima',
    instruction: 'Qual palavra rima com “gato”?',
    visual: { type: 'auditiva', pair: 'Gato / Rato', rhyme: 'Rima' },
  },
  {
    id: 'analise_sintese_1',
    area: 'analiseSintese',
    title: 'Análise-Síntese — Quebra-cabeça',
    instruction: 'Qual peça completa o desenho?',
    visual: { type: 'analise', missing: 'triangulo' },
  },
  {
    id: 'analise_sintese_2',
    area: 'analiseSintese',
    title: 'Análise-Síntese — Quebra-cabeça',
    instruction: 'Qual peça completa o quadrado?',
    visual: { type: 'analise', missing: 'quadrado' },
  },
  {
    id: 'analise_sintese_3',
    area: 'analiseSintese',
    title: 'Análise-Síntese — Quebra-cabeça',
    instruction: 'Qual peça completa o círculo?',
    visual: { type: 'analise', missing: 'circulo' },
  },
];

export function computeIARProfile(responses: Record<string, IARProtocolScore>) {
  const areas = Object.keys(IAR_AREA_LABELS).map((areaKey) => {
    const area = areaKey as IARAreaKey;
    const steps = IAR_PROTOCOL_STEPS.filter(step => step.area === area);
    const max = steps.length;
    const score = steps.reduce((acc, step) => acc + (responses[step.id] ?? 0), 0);
    const percentage = max > 0 ? Math.round((score / max) * 100) : 0;
    const status = percentage >= 75 ? 'Suficiente' : percentage >= 40 ? 'Em Emergência' : 'Insuficiente';
    return {
      area,
      label: IAR_AREA_LABELS[area],
      score,
      max,
      percentage,
      status,
    };
  });

  const answered = Object.keys(responses).length;
  return { areas, answered };
}
