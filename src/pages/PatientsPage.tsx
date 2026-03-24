import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight, Phone, Brain } from 'lucide-react';
import { getPatients, calculateAge, type Patient } from '@/lib/data';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setPatients(await getPatients());
    };
    load();
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.cid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between animate-fade-in mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/pacientes/novo"
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={16} /> Novo
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 animate-slide-up">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou CID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
      </div>

      {/* Patient List */}
      <div className="space-y-2">
        {filtered.map((patient, i) => {
          const ageYears = calculateAge(patient.birthDate);
          const birthMs = new Date(patient.birthDate).getTime();
          const totalMonths = Math.floor((Date.now() - birthMs) / (1000 * 60 * 60 * 24 * 30.44));

          return (
            <Link
              key={patient.id}
              to={`/pacientes/${patient.id}`}
              className="relative flex items-center justify-between bg-card rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow duration-300 active:scale-[0.98]"
              style={{ animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms both` }}
            >
              <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-sky-400" />
              <div className="flex items-center gap-3 pl-2">
                <div className="w-11 h-11 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center">
                  <Brain size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{patient.name}</p>
                  <p className="text-muted-foreground text-xs">{ageYears} anos e {totalMonths - ageYears * 12} meses</p>
                  {patient.cid && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {patient.cid}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {patient.phone && (
                  <span className="text-success">
                    <Phone size={18} />
                  </span>
                )}
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">Nenhum paciente encontrado.</p>
        </div>
      )}
    </div>
  );
}
