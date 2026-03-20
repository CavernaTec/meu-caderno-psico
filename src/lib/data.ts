import { deleteAllPatientMedia } from './mediaStore';

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

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const STORAGE_KEYS = {
  patients: 'ep_patients',
  sessions: 'ep_sessions',
  goals: 'ep_goals',
  notes: 'ep_notes',
  abc: 'ep_abc',
};

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Patients
export function getPatients(): Patient[] {
  return load<Patient>(STORAGE_KEYS.patients);
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find(p => p.id === id);
}

export function savePatient(patient: Omit<Patient, 'id' | 'createdAt'>): Patient {
  const patients = getPatients();
  const newPatient: Patient = { ...patient, id: generateId(), createdAt: new Date().toISOString() };
  patients.push(newPatient);
  save(STORAGE_KEYS.patients, patients);
  return newPatient;
}

export function updatePatient(id: string, data: Partial<Patient>) {
  const patients = getPatients().map(p => p.id === id ? { ...p, ...data } : p);
  save(STORAGE_KEYS.patients, patients);
}

export function deletePatient(id: string) {
  save(STORAGE_KEYS.patients, getPatients().filter(p => p.id !== id));
  save(STORAGE_KEYS.sessions, load<Session>(STORAGE_KEYS.sessions).filter(s => s.patientId !== id));
  save(STORAGE_KEYS.goals, load<PTIGoal>(STORAGE_KEYS.goals).filter(g => g.patientId !== id));
  save(STORAGE_KEYS.notes, load<EvolutionNote>(STORAGE_KEYS.notes).filter(n => n.patientId !== id));
  save(STORAGE_KEYS.abc, load<ABCRecord>(STORAGE_KEYS.abc).filter(r => r.patientId !== id));
  deleteAllPatientMedia(id);
}

// Sessions
export function getSessions(): Session[] {
  return load<Session>(STORAGE_KEYS.sessions);
}

export function getTodaySessions(): Session[] {
  const today = new Date().toISOString().split('T')[0];
  return getSessions().filter(s => s.date === today);
}

export function saveSession(session: Omit<Session, 'id'>): Session {
  const sessions = getSessions();
  const newSession: Session = { ...session, id: generateId() };
  sessions.push(newSession);
  save(STORAGE_KEYS.sessions, sessions);
  return newSession;
}

export function updateSession(id: string, data: Partial<Session>) {
  const sessions = getSessions().map(s => s.id === id ? { ...s, ...data } : s);
  save(STORAGE_KEYS.sessions, sessions);
}

export function deleteSession(id: string) {
  save(STORAGE_KEYS.sessions, getSessions().filter(s => s.id !== id));
}

// PTI Goals
export function getGoals(patientId: string): PTIGoal[] {
  return load<PTIGoal>(STORAGE_KEYS.goals).filter(g => g.patientId === patientId);
}

export function saveGoal(goal: Omit<PTIGoal, 'id'>): PTIGoal {
  const goals = load<PTIGoal>(STORAGE_KEYS.goals);
  const newGoal: PTIGoal = { ...goal, id: generateId() };
  goals.push(newGoal);
  save(STORAGE_KEYS.goals, goals);
  return newGoal;
}

export function updateGoal(id: string, data: Partial<PTIGoal>) {
  const goals = load<PTIGoal>(STORAGE_KEYS.goals).map(g => g.id === id ? { ...g, ...data } : g);
  save(STORAGE_KEYS.goals, goals);
}

export function deleteGoal(id: string) {
  save(STORAGE_KEYS.goals, load<PTIGoal>(STORAGE_KEYS.goals).filter(g => g.id !== id));
}

// Evolution Notes
export function getNotes(patientId: string): EvolutionNote[] {
  return load<EvolutionNote>(STORAGE_KEYS.notes).filter(n => n.patientId === patientId);
}

export function saveNote(note: Omit<EvolutionNote, 'id'>): EvolutionNote {
  const notes = load<EvolutionNote>(STORAGE_KEYS.notes);
  const newNote: EvolutionNote = { ...note, id: generateId() };
  notes.push(newNote);
  save(STORAGE_KEYS.notes, notes);
  return newNote;
}

export function deleteNote(id: string) {
  save(STORAGE_KEYS.notes, load<EvolutionNote>(STORAGE_KEYS.notes).filter(n => n.id !== id));
}

// ABC Records
export function getABCRecords(patientId: string): ABCRecord[] {
  return load<ABCRecord>(STORAGE_KEYS.abc).filter(r => r.patientId === patientId);
}

export function saveABCRecord(record: Omit<ABCRecord, 'id'>): ABCRecord {
  const records = load<ABCRecord>(STORAGE_KEYS.abc);
  const newRecord: ABCRecord = { ...record, id: generateId() };
  records.push(newRecord);
  save(STORAGE_KEYS.abc, records);
  return newRecord;
}

export function deleteABCRecord(id: string) {
  save(STORAGE_KEYS.abc, load<ABCRecord>(STORAGE_KEYS.abc).filter(r => r.id !== id));
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
