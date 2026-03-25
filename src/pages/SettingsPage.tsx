import { useState, useEffect } from 'react';
import { Save, Download, Upload, Trash2, User, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function getSetting(key: string, fallback: string): string {
  return localStorage.getItem(`setting_${key}`) || fallback;
}
function setSetting(key: string, value: string) {
  localStorage.setItem(`setting_${key}`, value);
}

export default function SettingsPage() {
  const [profName, setProfName] = useState('');
  const [profSpecialty, setProfSpecialty] = useState('');
  const [profCRP, setProfCRP] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'import' | 'clear'; file?: File } | null>(null);

  useEffect(() => {
    setProfName(getSetting('profName', ''));
    setProfSpecialty(getSetting('profSpecialty', 'Psicopedagoga'));
    setProfCRP(getSetting('profCRP', ''));
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setSetting('profName', profName);
    setSetting('profSpecialty', profSpecialty);
    setSetting('profCRP', profCRP);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const exportData = () => {
    const allKeys = Object.keys(localStorage);
    const data: Record<string, any> = {};
    allKeys.forEach(k => { data[k] = localStorage.getItem(k); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-caderno-psico-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exportado com sucesso!');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setConfirmAction({ type: 'import', file });
  };

  const executeImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, value as string);
        });
        toast.success('Dados importados com sucesso!');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast.error('Erro ao importar arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const executeClear = () => {
    localStorage.clear();
    toast.success('Todos os dados foram apagados.');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border h-16 flex items-center px-6 z-40">
        <h1 className="text-xl font-display font-bold text-foreground">Configurações</h1>
      </header>

      <div className="p-6 space-y-8 flex-1 overflow-auto w-full">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <User size={18} className="text-brand-600" />
              <h3 className="font-bold text-foreground">Perfil Profissional</h3>
            </div>
            
            <div className="bg-card rounded-[2rem] overflow-hidden shadow-sm border border-border h-full">
              <div className="h-2 bg-brand-500" />
              <div className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={profName} 
                    onChange={e => setProfName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-muted border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Especialidade</label>
                  <input 
                    type="text" 
                    value={profSpecialty} 
                    onChange={e => setProfSpecialty(e.target.value)}
                    placeholder="Ex: Psicopedagoga Clínica"
                    className="w-full bg-muted border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Registro (CRP/CBO)</label>
                  <input 
                    type="text" 
                    value={profCRP} 
                    onChange={e => setProfCRP(e.target.value)}
                    placeholder="Seu registro profissional"
                    className="w-full bg-muted border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4",
                    showSuccess ? "bg-success text-success-foreground" : "bg-foreground text-card"
                  )}
                >
                  {showSuccess ? <CheckCircle2 size={20} /> : <Save size={20} />}
                  <span>{showSuccess ? 'Salvo com Sucesso!' : isSaving ? 'Salvando...' : 'Salvar Perfil'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Shield size={18} className="text-brand-600" />
              <h3 className="font-bold text-foreground">Segurança e Backup</h3>
            </div>

            <div className="bg-card rounded-[2rem] overflow-hidden shadow-sm border border-border flex flex-col h-full">
              <div className="h-2 bg-indigo-500" />
              <div className="p-8 space-y-8 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Seus dados são armazenados localmente no navegador. Recomendamos exportar backups regularmente.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button 
                    onClick={exportData}
                    className="flex items-center justify-center gap-2 bg-muted text-foreground font-bold py-4 rounded-2xl hover:bg-border transition-colors border border-border"
                  >
                    <Download size={18} />
                    Exportar Backup
                  </button>
                  
                  <label className="flex items-center justify-center gap-2 bg-muted text-foreground font-bold py-4 rounded-2xl hover:bg-border transition-colors cursor-pointer border border-border">
                    <Upload size={18} />
                    Importar Backup
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>
                </div>

                <div className="pt-8 border-t border-border space-y-4 mt-auto">
                  <div className="flex items-center gap-2 text-destructive">
                    <Trash2 size={16} />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Zona de Perigo</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Apagar todos os dados permanentemente. Esta ação não pode ser desfeita.
                  </p>
                  <button 
                    onClick={() => setConfirmAction({ type: 'clear' })}
                    className="w-full bg-destructive/10 text-destructive font-bold py-4 rounded-2xl hover:bg-destructive/20 transition-colors border border-destructive/20"
                  >
                    Apagar Todos os Dados
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-border">
            <h3 className="text-xl font-bold text-foreground text-center mb-2">
              {confirmAction.type === 'clear' ? 'Apagar Todos os Dados?' : 'Importar Backup?'}
            </h3>
            <p className="text-muted-foreground text-center mb-8 text-sm">
              {confirmAction.type === 'clear' 
                ? 'Esta ação é irreversível. Todos os pacientes e dados serão perdidos.'
                : 'Os dados atuais serão substituídos pelos dados do backup importado.'
              }
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 font-bold text-muted-foreground bg-muted rounded-2xl hover:bg-border transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (confirmAction.type === 'clear') executeClear();
                  else if (confirmAction.file) executeImport(confirmAction.file);
                  setConfirmAction(null);
                }}
                className={cn(
                  "flex-1 py-3 font-bold rounded-2xl transition-colors shadow-lg",
                  confirmAction.type === 'clear' 
                    ? "text-destructive-foreground bg-destructive" 
                    : "text-primary-foreground bg-brand-600"
                )}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
