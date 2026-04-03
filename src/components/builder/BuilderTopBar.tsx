import { Monitor, Tablet, Smartphone, Save, Eye, Upload, ArrowLeft, Undo2, Redo2, Layers, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuilder } from '@/hooks/useBuilderState';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { DeviceMode } from '@/types/visual-builder';

interface Props {
  pageTitle: string;
  pageSlug?: string;
  onSave: () => void;
  onPublish: () => void;
  onView?: () => void;
  onPreview: () => void;
  onBack: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  saving: boolean;
}

const devices: { mode: DeviceMode; icon: React.FC<any>; label: string; width: string }[] = [
  { mode: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' },
  { mode: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
  { mode: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' },
];

const BuilderTopBar = ({ pageTitle, pageSlug, onSave, onPublish, onPreview, onBack, onView, onUndo, onRedo, canUndo, canRedo, saving }: Props) => {
  const { state, dispatch } = useBuilder();

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-3 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{pageTitle}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => dispatch({ type: 'TOGGLE_LAYERS' })}
        >
          <Layers className="h-4 w-4" />
        </Button>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onUndo} disabled={!canUndo}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p className="text-xs">Undo (Ctrl+Z)</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRedo} disabled={!canRedo}>
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p className="text-xs">Redo (Ctrl+Y)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Center — Device Switcher */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
        {devices.map(d => (
          <button
            key={d.mode}
            onClick={() => dispatch({ type: 'SET_DEVICE', payload: d.mode })}
            className={`p-1.5 rounded-md transition-colors ${
              state.deviceMode === d.mode
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={d.label}
          >
            <d.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPreview} className="h-8 text-xs">
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saving || !state.isDirty}
          className="h-8 text-xs"
        >
          <Save className="h-3.5 w-3.5 mr-1" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          size="sm"
          onClick={onPublish}
          disabled={saving}
          className="h-8 text-xs bg-primary"
        >
          <Upload className="h-3.5 w-3.5 mr-1" />
          Publish
        </Button>
      </div>
    </div>
  );
};

export default BuilderTopBar;
