import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { getPatients, calculateAge, type Patient } from '@/lib/data';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container max-w-2xl py-8 px-4 md:px-0">
      <div className="animate-fade-in mb-6">
        <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: '1.2' }}>Meus Pacientes</h1>
        <p className="text-muted-foreground text-sm mt-1">{patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search */}
      <div className="relative mb-5 animate-slide-up">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
      </div>

      {/* Patient List */}
      <div className="space-y-2">
        {filtered.map((patient, i) => (
          <Link
            key={patient.id}
            to={`/pacientes/${patient.id}`}
            className="flex items-center justify-between bg-card rounded-xl p-4 border hover:shadow-md transition-shadow duration-300 active:scale-[0.98]"
            style={{ animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms both` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/30 text-accent-foreground flex items-center justify-center font-bold text-sm">
                {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{patient.name}</p>
                <p className="text-muted-foreground text-xs">{calculateAge(patient.birthDate)} anos · {patient.cid}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">Nenhum paciente encontrado.</p>
        </div>
      )}

      <Link
        to="/pacientes/novo"
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 z-40"
        aria-label="Cadastrar novo paciente"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}
