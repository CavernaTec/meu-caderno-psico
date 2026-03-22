// ============================================================
// Test Models, Storage & Scoring Logic
// ============================================================

// ---------- Generic Storage ----------
const TESTS_KEY = 'ep_tests';

function loadAllTests(): Record<string, Record<string, any>> {
  try { return JSON.parse(localStorage.getItem(TESTS_KEY) || '{}'); } catch { return {}; }
}

function loadPatientTests(patientId: string): Record<string, any> {
  return loadAllTests()[patientId] || {};
}

function savePatientTest(patientId: string, testKey: string, data: any) {
  const all = loadAllTests();
  if (!all[patientId]) all[patientId] = {};
  all[patientId][testKey] = data;
  localStorage.setItem(TESTS_KEY, JSON.stringify(all));
}

// ============================================================
// 1. PORTAGE
// ============================================================
export interface PortageItem {
  id: string;
  text: string;
}

export interface PortageArea {
  key: string;
  label: string;
  items: Record<string, PortageItem[]>; // key = age range "0-1", "1-2", etc.
}

export type PortageAnswer = 1 | 0.5 | 0;

export interface PortageData {
  answers: Record<string, PortageAnswer>; // itemId -> answer
  completedAt?: string;
}

// Representative items per area per age range (simplified Portage)
export const PORTAGE_AREAS: PortageArea[] = [
  {
    key: 'socializacao',
    label: 'Socialização',
    items: {
      '0-1': [
        { id: 'soc_01_1', text: 'Observa uma pessoa que se move diretamente em seu campo de visão' },
        { id: 'soc_01_2', text: 'Sorri em resposta à atenção do adulto' },
        { id: 'soc_01_3', text: 'Vocaliza em resposta à atenção' },
        { id: 'soc_01_4', text: 'Olha para as próprias mãos' },
        { id: 'soc_01_5', text: 'Responde ao próprio nome' },
      ],
      '1-2': [
        { id: 'soc_12_1', text: 'Brinca sozinho junto a outras crianças' },
        { id: 'soc_12_2', text: 'Imita o adulto em tarefas simples' },
        { id: 'soc_12_3', text: 'Repete ações que produzem risos' },
        { id: 'soc_12_4', text: 'Dá um brinquedo ao adulto quando solicitado' },
      ],
      '2-3': [
        { id: 'soc_23_1', text: 'Cumprimenta adultos conhecidos sem que lhe peçam' },
        { id: 'soc_23_2', text: 'Obedece às regras do grupo' },
        { id: 'soc_23_3', text: 'Espera a sua vez' },
        { id: 'soc_23_4', text: 'Brinca interativamente com outras crianças' },
      ],
      '3-4': [
        { id: 'soc_34_1', text: 'Pede permissão para usar objetos dos outros' },
        { id: 'soc_34_2', text: 'Demonstra sentimentos de forma adequada' },
        { id: 'soc_34_3', text: 'Segue regras em jogos de grupo' },
      ],
      '4-5': [
        { id: 'soc_45_1', text: 'Pede ajuda quando tem dificuldade' },
        { id: 'soc_45_2', text: 'Contribui para a conversação dos adultos' },
        { id: 'soc_45_3', text: 'Explica regras de um jogo a outros' },
      ],
      '5-6': [
        { id: 'soc_56_1', text: 'Escolhe os próprios amigos' },
        { id: 'soc_56_2', text: 'Planifica e constrói utilizando ferramentas simples' },
        { id: 'soc_56_3', text: 'Coopera com 2 ou 3 crianças por 20 min' },
      ],
    },
  },
  {
    key: 'linguagem',
    label: 'Linguagem',
    items: {
      '0-1': [
        { id: 'lin_01_1', text: 'Reage ao som virando a cabeça' },
        { id: 'lin_01_2', text: 'Balbucia repetindo séries de sons' },
        { id: 'lin_01_3', text: 'Imita padrões de entonação' },
        { id: 'lin_01_4', text: 'Diz "mamã" ou "papá" sem ser por imitação' },
      ],
      '1-2': [
        { id: 'lin_12_1', text: 'Combina duas palavras para expressar uma ideia' },
        { id: 'lin_12_2', text: 'Usa "meu" ou "minha"' },
        { id: 'lin_12_3', text: 'Nomeia 5 objetos familiares' },
        { id: 'lin_12_4', text: 'Responde a perguntas simples com sim/não' },
      ],
      '2-3': [
        { id: 'lin_23_1', text: 'Usa frases de 3 palavras' },
        { id: 'lin_23_2', text: 'Faz perguntas: "o que é?"' },
        { id: 'lin_23_3', text: 'Usa plurais' },
        { id: 'lin_23_4', text: 'Conta experiências imediatas' },
      ],
      '3-4': [
        { id: 'lin_34_1', text: 'Usa frases complexas' },
        { id: 'lin_34_2', text: 'Relata experiências do dia' },
        { id: 'lin_34_3', text: 'Usa "porque" em frases' },
      ],
      '4-5': [
        { id: 'lin_45_1', text: 'Define palavras simples' },
        { id: 'lin_45_2', text: 'Reconta uma história com sequência lógica' },
        { id: 'lin_45_3', text: 'Usa conjunções para ligar frases' },
      ],
      '5-6': [
        { id: 'lin_56_1', text: 'Conta uma história com começo, meio e fim' },
        { id: 'lin_56_2', text: 'Responde a perguntas de "por que" com explicações' },
        { id: 'lin_56_3', text: 'Usa vocabulário de 2000+ palavras' },
      ],
    },
  },
  {
    key: 'autocuidado',
    label: 'Autocuidado',
    items: {
      '0-1': [
        { id: 'aut_01_1', text: 'Suga e engole líquidos' },
        { id: 'aut_01_2', text: 'Come alimentos pastosos' },
        { id: 'aut_01_3', text: 'Segura a mamadeira sozinho' },
      ],
      '1-2': [
        { id: 'aut_12_1', text: 'Bebe por uma chávena com ajuda' },
        { id: 'aut_12_2', text: 'Come com colher derramando pouco' },
        { id: 'aut_12_3', text: 'Tira meias e sapatos' },
      ],
      '2-3': [
        { id: 'aut_23_1', text: 'Alimenta-se sozinho com colher e garfo' },
        { id: 'aut_23_2', text: 'Lava e seca as mãos' },
        { id: 'aut_23_3', text: 'Controla esfíncteres durante o dia' },
      ],
      '3-4': [
        { id: 'aut_34_1', text: 'Veste-se com supervisão' },
        { id: 'aut_34_2', text: 'Abotoa e desabotoa' },
        { id: 'aut_34_3', text: 'Escova os dentes com ajuda' },
      ],
      '4-5': [
        { id: 'aut_45_1', text: 'Veste-se e despe-se sem ajuda' },
        { id: 'aut_45_2', text: 'Toma banho com supervisão mínima' },
        { id: 'aut_45_3', text: 'Usa o banheiro de forma independente' },
      ],
      '5-6': [
        { id: 'aut_56_1', text: 'Amarra os sapatos' },
        { id: 'aut_56_2', text: 'Escolhe roupas adequadas ao clima' },
        { id: 'aut_56_3', text: 'Prepara lanche simples' },
      ],
    },
  },
  {
    key: 'cognitivo',
    label: 'Cognitivo',
    items: {
      '0-1': [
        { id: 'cog_01_1', text: 'Segue visualmente um objeto em 180°' },
        { id: 'cog_01_2', text: 'Procura objeto que caiu' },
        { id: 'cog_01_3', text: 'Tira pano que cobre o rosto' },
      ],
      '1-2': [
        { id: 'cog_12_1', text: 'Faz torre de 3 cubos' },
        { id: 'cog_12_2', text: 'Encaixa formas geométricas simples' },
        { id: 'cog_12_3', text: 'Aponta partes do corpo em si' },
      ],
      '2-3': [
        { id: 'cog_23_1', text: 'Combina cores iguais' },
        { id: 'cog_23_2', text: 'Monta quebra-cabeça de 4 peças' },
        { id: 'cog_23_3', text: 'Classifica objetos por forma' },
      ],
      '3-4': [
        { id: 'cog_34_1', text: 'Nomeia 3 cores' },
        { id: 'cog_34_2', text: 'Conta até 5 de forma significativa' },
        { id: 'cog_34_3', text: 'Ordena 3 imagens em sequência' },
      ],
      '4-5': [
        { id: 'cog_45_1', text: 'Conta até 10 objetos' },
        { id: 'cog_45_2', text: 'Nomeia 8 cores' },
        { id: 'cog_45_3', text: 'Desenha uma pessoa com 6 partes' },
      ],
      '5-6': [
        { id: 'cog_56_1', text: 'Conta até 20' },
        { id: 'cog_56_2', text: 'Reconhece letras do próprio nome' },
        { id: 'cog_56_3', text: 'Agrupa por dois critérios simultâneos' },
      ],
    },
  },
  {
    key: 'motora',
    label: 'Desenvolvimento Motor',
    items: {
      '0-1': [
        { id: 'mot_01_1', text: 'Sustenta a cabeça quando em posição vertical' },
        { id: 'mot_01_2', text: 'Senta-se sem apoio' },
        { id: 'mot_01_3', text: 'Engatinha' },
        { id: 'mot_01_4', text: 'Anda com apoio' },
      ],
      '1-2': [
        { id: 'mot_12_1', text: 'Anda independentemente' },
        { id: 'mot_12_2', text: 'Sobe escadas engatinhando' },
        { id: 'mot_12_3', text: 'Atira uma bola' },
      ],
      '2-3': [
        { id: 'mot_23_1', text: 'Corre sem cair' },
        { id: 'mot_23_2', text: 'Salta com os dois pés' },
        { id: 'mot_23_3', text: 'Sobe escadas alternando os pés' },
      ],
      '3-4': [
        { id: 'mot_34_1', text: 'Pedala triciclo' },
        { id: 'mot_34_2', text: 'Equilibra-se num pé por 3 seg' },
        { id: 'mot_34_3', text: 'Corta com tesoura' },
      ],
      '4-5': [
        { id: 'mot_45_1', text: 'Salta num pé 5 vezes seguidas' },
        { id: 'mot_45_2', text: 'Apanha bola com as duas mãos' },
        { id: 'mot_45_3', text: 'Copia formas simples (quadrado, triângulo)' },
      ],
      '5-6': [
        { id: 'mot_56_1', text: 'Salta alternando os pés' },
        { id: 'mot_56_2', text: 'Anda na trave de equilíbrio' },
        { id: 'mot_56_3', text: 'Escreve o próprio nome' },
      ],
    },
  },
];

const AGE_RANGES = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6'];

export function getPortageData(patientId: string): PortageData {
  return loadPatientTests(patientId).portage || { answers: {} };
}

export function savePortageData(patientId: string, data: PortageData) {
  savePatientTest(patientId, 'portage', data);
}

/** Calculate developmental age in months per area.
 *  Formula: For each age range, devAge += (pointsObtained × 12) / totalItemsInRange
 *  Then sum across all ranges for each area. */
export function calculatePortageResults(data: PortageData) {
  const results: Record<string, { devAge: number; percentage: number }> = {};

  for (const area of PORTAGE_AREAS) {
    let devAge = 0;
    let totalScore = 0;
    let totalItems = 0;

    for (let ri = 0; ri < AGE_RANGES.length; ri++) {
      const range = AGE_RANGES[ri];
      const items = area.items[range] || [];
      if (items.length === 0) continue;

      let rangeScore = 0;
      items.forEach(item => {
        rangeScore += data.answers[item.id] ?? 0;
      });

      // (points × 12) / total items in this range
      devAge += (rangeScore * 12) / items.length;

      totalScore += rangeScore;
      totalItems += items.length;
    }

    const percentage = totalItems > 0 ? Math.round((totalScore / totalItems) * 100) : 0;
    results[area.key] = { devAge: Math.round(devAge * 10) / 10, percentage };
  }

  return results;
}

// ============================================================
// 2. EOCA
// ============================================================
export interface EOCAData {
  tematica: Record<string, boolean>;
  dinamica: Record<string, boolean>;
  produto: Record<string, boolean>;
  modalidade: string;
  observacoes: string;
  conclusao: string;
}

export const EOCA_TEMATICA = [
  { id: 'et1', text: 'Evita a tarefa / demonstra resistência' },
  { id: 'et2', text: 'Tem disponibilidade para aprender' },
  { id: 'et3', text: 'Apresenta iniciativa' },
  { id: 'et4', text: 'Demonstra curiosidade' },
  { id: 'et5', text: 'Realiza a atividade com prazer' },
  { id: 'et6', text: 'Demonstra ansiedade diante da tarefa' },
  { id: 'et7', text: 'Necessita de aprovação constante' },
];

export const EOCA_DINAMICA = [
  { id: 'ed1', text: 'Tem ritmo adequado na execução' },
  { id: 'ed2', text: 'Apresenta tolerância à frustração' },
  { id: 'ed3', text: 'Mantém atenção na atividade' },
  { id: 'ed4', text: 'Tempo de permanência adequado' },
  { id: 'ed5', text: 'Organiza o material de trabalho' },
  { id: 'ed6', text: 'Apresenta movimentos corporais associados' },
];

export const EOCA_PRODUTO = [
  { id: 'ep1', text: 'Utiliza a linguagem oral adequadamente' },
  { id: 'ep2', text: 'Produção gráfica adequada à idade' },
  { id: 'ep3', text: 'Realiza cálculos mentais simples' },
  { id: 'ep4', text: 'Demonstra compreensão de leitura' },
  { id: 'ep5', text: 'Escrita coerente e organizada' },
  { id: 'ep6', text: 'Reconhece letras e números' },
];

export const EOCA_MODALIDADES = [
  { value: 'hipoassimilativa', label: 'Hipoassimilação', desc: 'Pobreza de contato com o objeto, esquemas empobrecidos, não se dá conta das diferenças.' },
  { value: 'hiperassimilativa', label: 'Hiperassimilação', desc: 'Internaliza excessivamente os objetos sem acomodá-los. Predomínio da subjetividade, fantasia excessiva.' },
  { value: 'hipoacomodativa', label: 'Hipoacomodação', desc: 'Pobreza de contato com o objeto por falta de exercitação. Dificuldade de internalização de imagens.' },
  { value: 'hiperacomodativa', label: 'Hiperacomodação', desc: 'Predomínio da imitação, superestimulação da imitação. Pouca atividade lúdica e criatividade.' },
];

export function getEOCAData(patientId: string): EOCAData {
  return loadPatientTests(patientId).eoca || { tematica: {}, dinamica: {}, produto: {}, modalidade: '', observacoes: '', conclusao: '' };
}

export function saveEOCAData(patientId: string, data: EOCAData) {
  savePatientTest(patientId, 'eoca', data);
}

// ============================================================
// 3. AUTONOMIA (Humanizzare)
// ============================================================
export interface AutonomyItem {
  id: string;
  text: string;
  category: string;
}

export type AutonomyScore = 0 | 1 | 2 | 3 | 4;

export interface AutonomyData {
  scores: Record<string, AutonomyScore>;
  observacoes: string;
}

export const AUTONOMY_LEVELS = [
  { value: 0, label: 'Não realiza', desc: 'Não faz a atividade' },
  { value: 1, label: 'Ajuda total', desc: 'Necessita de ajuda total' },
  { value: 2, label: 'Ajuda parcial', desc: 'Realiza com ajuda parcial' },
  { value: 3, label: 'Supervisão', desc: 'Realiza com supervisão' },
  { value: 4, label: 'Independente', desc: 'Realiza de forma independente' },
];

export const AUTONOMY_ITEMS: AutonomyItem[] = [
  // Rotina Diária
  { id: 'rd1', text: 'Escova os dentes', category: 'Rotina Diária' },
  { id: 'rd2', text: 'Toma banho', category: 'Rotina Diária' },
  { id: 'rd3', text: 'Veste-se', category: 'Rotina Diária' },
  { id: 'rd4', text: 'Alimenta-se sozinho', category: 'Rotina Diária' },
  { id: 'rd5', text: 'Usa o banheiro', category: 'Rotina Diária' },
  { id: 'rd6', text: 'Organiza seus pertences', category: 'Rotina Diária' },
  { id: 'rd7', text: 'Prepara lanche simples', category: 'Rotina Diária' },
  // Habilidades Acadêmicas
  { id: 'ha1', text: 'Reconhece letras', category: 'Habilidades Acadêmicas' },
  { id: 'ha2', text: 'Escreve o próprio nome', category: 'Habilidades Acadêmicas' },
  { id: 'ha3', text: 'Reconhece números de 0 a 10', category: 'Habilidades Acadêmicas' },
  { id: 'ha4', text: 'Copia palavras do quadro', category: 'Habilidades Acadêmicas' },
  { id: 'ha5', text: 'Realiza cálculos simples', category: 'Habilidades Acadêmicas' },
  { id: 'ha6', text: 'Segue instruções em sala', category: 'Habilidades Acadêmicas' },
  { id: 'ha7', text: 'Organiza material escolar', category: 'Habilidades Acadêmicas' },
  // Habilidades Sociais
  { id: 'hs1', text: 'Interage com colegas', category: 'Habilidades Sociais' },
  { id: 'hs2', text: 'Espera sua vez', category: 'Habilidades Sociais' },
  { id: 'hs3', text: 'Expressa necessidades verbalmente', category: 'Habilidades Sociais' },
  { id: 'hs4', text: 'Compartilha brinquedos', category: 'Habilidades Sociais' },
  { id: 'hs5', text: 'Respeita regras em grupo', category: 'Habilidades Sociais' },
];

export function getAutonomyData(patientId: string): AutonomyData {
  return loadPatientTests(patientId).autonomy || { scores: {}, observacoes: '' };
}

export function saveAutonomyData(patientId: string, data: AutonomyData) {
  savePatientTest(patientId, 'autonomy', data);
}

export function calculateAutonomyResults(data: AutonomyData) {
  const categories = [...new Set(AUTONOMY_ITEMS.map(i => i.category))];
  const results: Record<string, { score: number; max: number; percentage: number }> = {};

  for (const cat of categories) {
    const items = AUTONOMY_ITEMS.filter(i => i.category === cat);
    let score = 0;
    items.forEach(item => { score += data.scores[item.id] ?? 0; });
    results[cat] = { score, max: items.length * 4, percentage: Math.round((score / (items.length * 4)) * 100) };
  }

  return results;
}

// ============================================================
// 4. M-CHAT-R
// ============================================================
export interface MCHATData {
  answers: Record<string, boolean>; // true = pass, false = fail
}

export interface MCHATQuestion {
  id: string;
  text: string;
  critical: boolean;
  reverseScored: boolean; // true means "Sim" = fail
}

export const MCHAT_QUESTIONS: MCHATQuestion[] = [
  { id: 'mc1', text: 'Se você aponta algo do outro lado do quarto, a criança olha para o que você está apontando?', critical: false, reverseScored: false },
  { id: 'mc2', text: 'Você já imaginou se a criança pode ser surda?', critical: false, reverseScored: true },
  { id: 'mc3', text: 'A criança brinca de faz-de-conta? (por ex: finge beber de um copo vazio)', critical: true, reverseScored: false },
  { id: 'mc4', text: 'A criança gosta de subir nos móveis ou em brinquedos de escalar?', critical: false, reverseScored: false },
  { id: 'mc5', text: 'A criança faz movimentos incomuns com os dedos perto dos próprios olhos?', critical: true, reverseScored: true },
  { id: 'mc6', text: 'A criança aponta com o dedo para pedir algo ou pedir ajuda?', critical: true, reverseScored: false },
  { id: 'mc7', text: 'A criança aponta com o dedo para mostrar algo interessante?', critical: true, reverseScored: false },
  { id: 'mc8', text: 'A criança se interessa por outras crianças?', critical: false, reverseScored: false },
  { id: 'mc9', text: 'A criança mostra objetos trazendo-os ou levantando-os para você ver?', critical: true, reverseScored: false },
  { id: 'mc10', text: 'A criança responde quando chamada pelo nome?', critical: false, reverseScored: false },
  { id: 'mc11', text: 'A criança sorri de volta quando você sorri para ela?', critical: false, reverseScored: false },
  { id: 'mc12', text: 'A criança se incomoda com barulhos do dia a dia (ex: aspirador, música alta)?', critical: false, reverseScored: true },
  { id: 'mc13', text: 'A criança anda?', critical: false, reverseScored: false },
  { id: 'mc14', text: 'A criança olha nos seus olhos quando você fala com ela?', critical: true, reverseScored: false },
  { id: 'mc15', text: 'A criança tenta imitar o que você faz? (ex: dar tchau)', critical: false, reverseScored: false },
  { id: 'mc16', text: 'Se você vira a cabeça para olhar algo, a criança olha ao redor para ver o que você está olhando?', critical: false, reverseScored: false },
  { id: 'mc17', text: 'A criança tenta fazer com que você olhe para ela?', critical: false, reverseScored: false },
  { id: 'mc18', text: 'A criança entende quando você pede algo? (ex: não usar gestos)', critical: false, reverseScored: false },
  { id: 'mc19', text: 'Quando algo novo acontece, a criança olha para seu rosto para ver sua reação?', critical: true, reverseScored: false },
  { id: 'mc20', text: 'A criança gosta de atividades com movimento? (ex: ser balançada)', critical: false, reverseScored: false },
  { id: 'mc21', text: 'A criança faz contato visual com você?', critical: false, reverseScored: false },
  { id: 'mc22', text: 'A criança demonstra ter sentimentos pelo outros? (ex: carinho)', critical: false, reverseScored: false },
  { id: 'mc23', text: 'A criança faz gestos (ex: dar tchau, mandar beijo)?', critical: false, reverseScored: false },
];

export function getMCHATData(patientId: string): MCHATData {
  return loadPatientTests(patientId).mchat || { answers: {} };
}

export function saveMCHATData(patientId: string, data: MCHATData) {
  savePatientTest(patientId, 'mchat', data);
}

export function calculateMCHATResult(data: MCHATData) {
  let totalFails = 0;
  let criticalFails = 0;
  const answered = Object.keys(data.answers).length;

  MCHAT_QUESTIONS.forEach(q => {
    if (data.answers[q.id] === undefined) return;
    const answer = data.answers[q.id]; // true=Sim, false=Não
    const failed = q.reverseScored ? answer : !answer;
    if (failed) {
      totalFails++;
      if (q.critical) criticalFails++;
    }
  });

  const risk = totalFails >= 3 || criticalFails >= 2;
  return { totalFails, criticalFails, risk, answered, total: 23 };
}

// ============================================================
// 5. CARS
// ============================================================
export interface CARSData {
  scores: Record<string, number>; // 1-4
}

export interface CARSItem {
  id: string;
  label: string;
}

export const CARS_ITEMS: CARSItem[] = [
  { id: 'cars1', label: 'Relação com as pessoas' },
  { id: 'cars2', label: 'Imitação' },
  { id: 'cars3', label: 'Resposta emocional' },
  { id: 'cars4', label: 'Uso do corpo' },
  { id: 'cars5', label: 'Uso de objetos' },
  { id: 'cars6', label: 'Adaptação à mudança' },
  { id: 'cars7', label: 'Resposta visual' },
  { id: 'cars8', label: 'Resposta auditiva' },
  { id: 'cars9', label: 'Resposta e uso do paladar, olfato e tato' },
  { id: 'cars10', label: 'Medo ou nervosismo' },
  { id: 'cars11', label: 'Comunicação verbal' },
  { id: 'cars12', label: 'Comunicação não-verbal' },
  { id: 'cars13', label: 'Nível de atividade' },
  { id: 'cars14', label: 'Nível e consistência da resposta intelectual' },
  { id: 'cars15', label: 'Impressão geral' },
];

export function getCARSData(patientId: string): CARSData {
  return loadPatientTests(patientId).cars || { scores: {} };
}

export function saveCARSData(patientId: string, data: CARSData) {
  savePatientTest(patientId, 'cars', data);
}

export function calculateCARSResult(data: CARSData) {
  let total = 0;
  let answered = 0;
  CARS_ITEMS.forEach(item => {
    if (data.scores[item.id]) {
      total += data.scores[item.id];
      answered++;
    }
  });

  let classification = 'Sem Autismo';
  if (total >= 37) classification = 'Autismo Grave';
  else if (total >= 30) classification = 'Autismo Leve/Moderado';

  return { total, answered, totalItems: 15, classification };
}

// ============================================================
// Consolidated results for PDF
// ============================================================
export function getAllTestResults(patientId: string) {
  const portage = getPortageData(patientId);
  const eoca = getEOCAData(patientId);
  const autonomy = getAutonomyData(patientId);
  const mchat = getMCHATData(patientId);
  const cars = getCARSData(patientId);

  return {
    portage: { data: portage, results: calculatePortageResults(portage) },
    eoca: { data: eoca },
    autonomy: { data: autonomy, results: calculateAutonomyResults(autonomy) },
    mchat: { data: mchat, results: calculateMCHATResult(mchat) },
    cars: { data: cars, results: calculateCARSResult(cars) },
  };
}
