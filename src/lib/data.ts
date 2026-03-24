import { deleteAllPatientMedia } from './mediaStore';
import { dbGet, dbGetAll, dbGetAllByIndex, dbPut, dbDelete } from './localDb';

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  cid: string;
  parentNames: string;
  phone: string;
  createdAt: string;
}

export interface Session {
  id: string;
  patientId: string;
  date: string;
  time: string;
  notes: string;
  completed: boolean;
}

export interface PTIGoal {
  id: string;
  patientId: string;
  area: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
}

export interface EvolutionNote {
  id: string;
  patientId: string;
  date: string;
  content: string;
}

export interface ABCRecord {
  id: string;
  patientId: string;
  date: string;
  antecedent: string;
  behavior: string;
  consequence: string;
}

export type IARStatus = 'desenvolvido' | 'em_desenvolvimento' | 'dificuldade' | '';

export interface IARData {
  esquemaCorporal: IARStatus;
  lateralidade: IARStatus;
  orientacaoEspacialTemporal: IARStatus;
  discriminacaoVisualAuditiva: IARStatus;
  coordenacaoVisomotora: IARStatus;
  memoria: IARStatus;
}

export type IARProtocolScore = 0 | 0.5 | 1;

export interface IARProtocolData {
  responses: Record<string, IARProtocolScore>;
  updatedAt?: string;
}

export interface InstrumentRecord {
  applied: boolean;
  result: string;
}

export interface InstrumentsData {
  eoca: InstrumentRecord;
  provasOperatorias: InstrumentRecord;
  tecnicasProjetivas: InstrumentRecord;
  anamnese: InstrumentRecord;
  cars2: InstrumentRecord;
  mchatR: InstrumentRecord;
  proteaR: InstrumentRecord;
}

export type WritingLevel = 'pre_silabico' | 'silabico' | 'silabico_alfabetico' | 'alfabetico' | '';

export interface ProbesData {
  writingLevel: WritingLevel;
  mathNotes: string;
  psychomotorNotes: string;
}

export interface AssessmentData {
  iar: IARData;
  iarProtocol: IARProtocolData;
  instruments: InstrumentsData;
  probes: ProbesData;
  diagnosticHypothesis: string;
}

interface AssessmentRecord {
  patientId: string;
  data: AssessmentData;
}

const EMPTY_INSTRUMENT: InstrumentRecord = { applied: false, result: '' };

export function getDefaultAssessment(): AssessmentData {
  return {
    iar: {
      esquemaCorporal: '',
      lateralidade: '',
      orientacaoEspacialTemporal: '',
      discriminacaoVisualAuditiva: '',
      coordenacaoVisomotora: '',
      memoria: '',
    },
    iarProtocol: {
      responses: {},
    },
    instruments: {
      eoca: { ...EMPTY_INSTRUMENT },
      provasOperatorias: { ...EMPTY_INSTRUMENT },
      tecnicasProjetivas: { ...EMPTY_INSTRUMENT },
      anamnese: { ...EMPTY_INSTRUMENT },
      cars2: { ...EMPTY_INSTRUMENT },
      mchatR: { ...EMPTY_INSTRUMENT },
      proteaR: { ...EMPTY_INSTRUMENT },
    },
    probes: { writingLevel: '', mathNotes: '', psychomotorNotes: '' },
    diagnosticHypothesis: '',
  };
}

export async function getAssessment(patientId: string): Promise<AssessmentData> {
  const record = await dbGet<AssessmentRecord>('assessments', patientId);
  const stored = record?.data;
  if (!stored) return getDefaultAssessment();
  const base = getDefaultAssessment();
  return {
    ...base,
    ...stored,
    iar: { ...base.iar, ...(stored.iar || {}) },
    iarProtocol: stored.iarProtocol || base.iarProtocol,
    instruments: { ...base.instruments, ...(stored.instruments || {}) },
    probes: { ...base.probes, ...(stored.probes || {}) },
  };
}

export async function saveAssessment(patientId: string, data: AssessmentData) {
  await dbPut<AssessmentRecord>('assessments', { patientId, data });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Patients
export async function getPatients(): Promise<Patient[]> {
  return dbGetAll<Patient>('patients');
}

export async function getPatient(id: string): Promise<Patient | undefined> {
  return dbGet<Patient>('patients', id);
}

export async function savePatient(patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
  const newPatient: Patient = { ...patient, id: generateId(), createdAt: new Date().toISOString() };
  await dbPut('patients', newPatient);
  return newPatient;
}

export async function updatePatient(id: string, data: Partial<Patient>) {
  const existing = await dbGet<Patient>('patients', id);
  if (!existing) return;
  await dbPut('patients', { ...existing, ...data });
}

export async function deletePatient(id: string) {
  await dbDelete('patients', id);

  const sessions = await dbGetAllByIndex<Session>('sessions', 'patientId', id);
  await Promise.all(sessions.map(s => dbDelete('sessions', s.id)));

  const goals = await dbGetAllByIndex<PTIGoal>('goals', 'patientId', id);
  await Promise.all(goals.map(g => dbDelete('goals', g.id)));

  const notes = await dbGetAllByIndex<EvolutionNote>('notes', 'patientId', id);
  await Promise.all(notes.map(n => dbDelete('notes', n.id)));

  const abcs = await dbGetAllByIndex<ABCRecord>('abc', 'patientId', id);
  await Promise.all(abcs.map(r => dbDelete('abc', r.id)));

  await dbDelete('assessments', id);

  const tests = await dbGetAllByIndex<{ id: string }>('tests', 'patientId', id);
  await Promise.all(tests.map(t => dbDelete('tests', t.id)));

  await deleteAllPatientMedia(id);
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  return dbGetAll<Session>('sessions');
}

export async function getTodaySessions(): Promise<Session[]> {
  const today = new Date().toISOString().split('T')[0];
  const sessions = await getSessions();
  return sessions.filter(s => s.date === today);
}

export async function saveSession(session: Omit<Session, 'id'>): Promise<Session> {
  const newSession: Session = { ...session, id: generateId() };
  await dbPut('sessions', newSession);
  return newSession;
}

export async function updateSession(id: string, data: Partial<Session>) {
  const existing = await dbGet<Session>('sessions', id);
  if (!existing) return;
  await dbPut('sessions', { ...existing, ...data });
}

export async function deleteSession(id: string) {
  await dbDelete('sessions', id);
}

// PTI Goals
export async function getGoals(patientId: string): Promise<PTIGoal[]> {
  return dbGetAllByIndex<PTIGoal>('goals', 'patientId', patientId);
}

export async function saveGoal(goal: Omit<PTIGoal, 'id'>): Promise<PTIGoal> {
  const newGoal: PTIGoal = { ...goal, id: generateId() };
  await dbPut('goals', newGoal);
  return newGoal;
}

export async function updateGoal(id: string, data: Partial<PTIGoal>) {
  const existing = await dbGet<PTIGoal>('goals', id);
  if (!existing) return;
  await dbPut('goals', { ...existing, ...data });
}

export async function deleteGoal(id: string) {
  await dbDelete('goals', id);
}

// Evolution Notes
export async function getNotes(patientId: string): Promise<EvolutionNote[]> {
  return dbGetAllByIndex<EvolutionNote>('notes', 'patientId', patientId);
}

export async function saveNote(note: Omit<EvolutionNote, 'id'>): Promise<EvolutionNote> {
  const newNote: EvolutionNote = { ...note, id: generateId() };
  await dbPut('notes', newNote);
  return newNote;
}

export async function deleteNote(id: string) {
  await dbDelete('notes', id);
}

// ABC Records
export async function getABCRecords(patientId: string): Promise<ABCRecord[]> {
  return dbGetAllByIndex<ABCRecord>('abc', 'patientId', patientId);
}

export async function saveABCRecord(record: Omit<ABCRecord, 'id'>): Promise<ABCRecord> {
  const newRecord: ABCRecord = { ...record, id: generateId() };
  await dbPut('abc', newRecord);
  return newRecord;
}

export async function deleteABCRecord(id: string) {
  await dbDelete('abc', id);
}


export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    not_started: 'Não Iniciado',
    in_progress: 'Em Progresso',
    completed: 'Concluído',
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    not_started: 'bg-muted text-muted-foreground',
    in_progress: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
  };
  return map[status] || '';
}
