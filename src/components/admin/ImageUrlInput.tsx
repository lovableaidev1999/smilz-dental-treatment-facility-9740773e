import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';
import MediaPickerDialog from '@/components/builder/MediaPickerDialog';

interface ImageUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ImageUrlInput = ({ value, onChange, placeholder = "https://...", className, disabled }: ImageUrlInputProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0"
        onClick={() => setPickerOpen(true)}
        disabled={disabled}
        title="Pick from Media Library"
      >
        <Image className="h-4 w-4" />
      </Button>
      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
};

export default ImageUrlInput;
