import { useEffect, useState, useRef } from 'react';
import { Plus, Image, Trash2, X } from 'lucide-react';
import { getMedia, saveMedia, deleteMedia, formatDate, type MediaItem } from '@/lib/data';
import { toast } from 'sonner';

export default function MediaTab({ patientId }: { patientId: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(getMedia(patientId).sort((a, b) => b.date.localeCompare(a.date)));
  }, [patientId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande (máx 5MB).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        saveMedia({
          patientId,
          date: new Date().toISOString().split('T')[0],
          name: file.name,
          type: file.type,
          dataUrl,
        });
        setItems(getMedia(patientId).sort((a, b) => b.date.localeCompare(a.date)));
        toast.success(`${file.name} adicionado!`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }

  function handleDelete(id: string) {
    if (!confirm('Remover esta mídia?')) return;
    deleteMedia(id);
    setItems(getMedia(patientId).sort((a, b) => b.date.localeCompare(a.date)));
    toast.success('Mídia removida.');
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-foreground">Mídia</h2>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:opacity-80 active:scale-95 transition-all"
        >
          <Plus size={16} /> Adicionar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Image size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma foto adicionada ainda.</p>
          <p className="text-xs mt-1">Toque em "Adicionar" para enviar fotos.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {items.map(item => (
          <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden border bg-muted">
            <img
              src={item.dataUrl}
              alt={item.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setPreview(item)}
            />
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
            >
              <Trash2 size={12} />
            </button>
            <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 truncate">
              {formatDate(item.date)}
            </p>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setPreview(null)}>
            <X size={28} />
          </button>
          <img src={preview.dataUrl} alt={preview.name} className="max-w-full max-h-[80vh] rounded-xl" />
        </div>
      )}
    </div>
  );
}
