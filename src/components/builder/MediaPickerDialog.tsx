import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Search, Loader2, Check } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const MediaPickerDialog = ({ open, onClose, onSelect }: Props) => {
  const [search, setSearch] = useState('');
  const [selectedUrl, setSelectedUrl] = useState('');
  const { compress, isCompressing } = useImageUpload();
  const { toast } = useToast();

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['media_library_picker'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const filtered = items?.filter(i =>
    !search || i.file_name?.toLowerCase().includes(search.toLowerCase()) || i.alt_text?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file: compressed } = await compress(file);
      const path = `builder/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from('media').upload(path, compressed, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      // Also add to media_library table
      await supabase.from('media_library').insert({
        file_name: compressed.name,
        file_url: data.publicUrl,
        file_type: compressed.type,
        file_size: compressed.size,
      });
      refetch();
      onSelect(data.publicUrl);
      onClose();
      toast({ title: 'Image uploaded!' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
    e.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search images…" className="pl-9 h-9" />
          </div>
          <Button variant="outline" size="sm" className="h-9 relative" disabled={isCompressing}>
            {isCompressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
            Upload
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-muted rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedUrl(item.file_url)}
                  onDoubleClick={() => { onSelect(item.file_url); onClose(); }}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                    selectedUrl === item.file_url ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                  }`}
                >
                  <img src={item.file_url} alt={item.alt_text || item.file_name} className="w-full h-full object-cover" />
                  {selectedUrl === item.file_url && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-4 text-center text-muted-foreground py-8 text-sm">No images found</p>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!selectedUrl} onClick={() => { onSelect(selectedUrl); onClose(); }}>
            Select Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPickerDialog;
