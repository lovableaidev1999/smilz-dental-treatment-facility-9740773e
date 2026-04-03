import { useState } from 'react';
import { useBuilder } from '@/hooks/useBuilderState';
import { getBlockDefinition, getBlockIcon, LAYOUT_PRESETS } from './block-registry';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Clipboard, ImageIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import MediaPickerDialog from './MediaPickerDialog';
import type { DeviceMode, ResponsiveProps } from '@/types/visual-builder';

const PropertiesPanel = () => {
  const { state, dispatch, findNode } = useBuilder();
  const { selectedBlockId, deviceMode } = state;
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ type: 'prop'; key: string } | { type: 'array-item'; key: string; index: number } | null>(null);

  if (!selectedBlockId) {
    return (
      <div className="p-4 text-center text-muted-foreground text-xs">
        <p>Select a block to edit its properties</p>
      </div>
    );
  }

  const node = findNode(selectedBlockId);
  if (!node) return null;

  const def = getBlockDefinition(node.type);
  const Icon = def ? getBlockIcon(def) : null;

  const updateProp = (key: string, value: any) => {
    dispatch({ type: 'UPDATE_BLOCK_PROPS', payload: { blockId: selectedBlockId, props: { [key]: value } } });
  };

  const updateResponsive = (key: keyof ResponsiveProps, value: any) => {
    dispatch({
      type: 'UPDATE_RESPONSIVE',
      payload: { blockId: selectedBlockId, device: deviceMode, props: { [key]: value } },
    });
  };

  const responsiveValue = (key: keyof ResponsiveProps) =>
    node.responsive?.[deviceMode]?.[key] ?? '';

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full">
      {/* Block header */}
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <span className="text-sm font-semibold text-foreground">{def?.label || node.type}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-7"
          onClick={() => dispatch({ type: 'DUPLICATE_BLOCK', payload: selectedBlockId })}>
          <Copy className="h-3 w-3 mr-1" /> Duplicate
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs h-7"
          onClick={() => dispatch({ type: 'COPY_BLOCK', payload: selectedBlockId })}>
          <Clipboard className="h-3 w-3 mr-1" /> Copy
        </Button>
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-7"
          disabled={!state.clipboardBlock}
          onClick={() => dispatch({ type: 'PASTE_BLOCK', payload: { parentId: null } })}>
          <Clipboard className="h-3 w-3 mr-1" /> Paste
        </Button>
        <Button variant="destructive" size="sm" className="flex-1 text-xs h-7"
          onClick={() => dispatch({ type: 'DELETE_BLOCK', payload: selectedBlockId })}>
          <Trash2 className="h-3 w-3 mr-1" /> Delete
        </Button>
      </div>

      <Separator />

      {/* Content Props */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Content</p>
        {renderContentProps(node, updateProp, {
          onOpenMediaPicker: () => {
            setMediaPickerTarget({ type: 'prop', key: 'src' });
            setShowMediaPicker(true);
          },
          onOpenMediaPickerForArray: (key: string, index: number) => {
            setMediaPickerTarget({ type: 'array-item', key, index });
            setShowMediaPicker(true);
          },
        })}
      </div>

      <Separator />

      {/* Responsive Style Props */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
          Style ({deviceMode})
        </p>
        <div className="space-y-2">
          <PropField label="Padding" value={responsiveValue('padding')} onChange={v => updateResponsive('padding', v)} placeholder="e.g. 1rem 2rem" />
          <PropField label="Margin" value={responsiveValue('margin')} onChange={v => updateResponsive('margin', v)} placeholder="e.g. 0 auto" />
          <PropField label="Font Size" value={responsiveValue('fontSize')} onChange={v => updateResponsive('fontSize', v)} placeholder="e.g. 1.5rem" />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Text Align</Label>
            <Select value={responsiveValue('textAlign') as string || ''} onValueChange={v => updateResponsive('textAlign', v as any)}>
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Visibility</Label>
            <Select value={responsiveValue('display') as string || 'block'} onValueChange={v => updateResponsive('display', v as any)}>
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Visible</SelectItem>
                <SelectItem value="none">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(node.type === 'section' || node.type === 'column') && (
            <>
              <PropField label="Gap" value={responsiveValue('gap')} onChange={v => updateResponsive('gap', v)} placeholder="e.g. 1rem" />
              <div className="flex items-center justify-between">
                <Label className="text-xs">Direction</Label>
                <Select value={responsiveValue('flexDirection') as string || ''} onValueChange={v => updateResponsive('flexDirection', v as any)}>
                  <SelectTrigger className="h-7 w-24 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="row">Row</SelectItem>
                    <SelectItem value="column">Column</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Align Items</Label>
                <Select value={responsiveValue('alignItems') as string || ''} onValueChange={v => updateResponsive('alignItems', v as any)}>
                  <SelectTrigger className="h-7 w-24 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                    <SelectItem value="stretch">Stretch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Justify</Label>
                <Select value={responsiveValue('justifyContent') as string || ''} onValueChange={v => updateResponsive('justifyContent', v as any)}>
                  <SelectTrigger className="h-7 w-24 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                    <SelectItem value="space-between">Space Between</SelectItem>
                    <SelectItem value="space-around">Space Around</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Animation Props */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Animation</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Entrance</Label>
            <Select value={node.props.animation || 'none'} onValueChange={v => updateProp('animation', v === 'none' ? '' : v)}>
              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade-in">Fade In</SelectItem>
                <SelectItem value="slide-up">Slide Up</SelectItem>
                <SelectItem value="slide-left">Slide Left</SelectItem>
                <SelectItem value="slide-right">Slide Right</SelectItem>
                <SelectItem value="scale-in">Scale In</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropField label="Delay (ms)" value={node.props.animationDelay || ''} onChange={v => updateProp('animationDelay', v)} placeholder="e.g. 200" />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Hover Effect</Label>
            <Select value={node.props.hoverEffect || 'none'} onValueChange={v => updateProp('hoverEffect', v === 'none' ? '' : v)}>
              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="lift">Lift</SelectItem>
                <SelectItem value="glow">Glow</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Media Picker for image blocks */}
      <MediaPickerDialog
        open={showMediaPicker}
        onClose={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }}
        onSelect={(url) => {
          if (mediaPickerTarget?.type === 'array-item') {
            const arr = [...(node.props[mediaPickerTarget.key] || [])];
            arr[mediaPickerTarget.index] = { ...arr[mediaPickerTarget.index], src: url };
            updateProp(mediaPickerTarget.key, arr);
          } else {
            updateProp('src', url);
          }
          setMediaPickerTarget(null);
        }}
      />
    </div>
  );
};

// Simple field helper
const PropField = ({ label, value, onChange, placeholder, multiline }: {
  label: string; value: any; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    {multiline ? (
      <Textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="text-xs min-h-[60px]" />
    ) : (
      <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-7 text-xs" />
    )}
  </div>
);

// Render content-specific props per block type
function renderContentProps(node: any, updateProp: (k: string, v: any) => void, extra?: { onOpenMediaPicker?: () => void; onOpenMediaPickerForArray?: (key: string, index: number) => void }) {
  const { type, props } = node;

  switch (type) {
    case 'heading':
      return (
        <>
          <PropField label="Text" value={props.text} onChange={v => updateProp('text', v)} />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Level</Label>
            <Select value={String(props.level)} onValueChange={v => updateProp('level', parseInt(v))}>
              <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropField label="Color" value={props.color} onChange={v => updateProp('color', v)} placeholder="CSS color" />
        </>
      );

    case 'text':
      return (
        <>
          <PropField label="Text" value={props.text} onChange={v => updateProp('text', v)} multiline />
          <PropField label="Color" value={props.color} onChange={v => updateProp('color', v)} placeholder="CSS color" />
        </>
      );

    case 'image':
      return (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Image URL</Label>
            <div className="flex gap-1">
              <Input value={props.src || ''} onChange={e => updateProp('src', e.target.value)} placeholder="https://..." className="h-7 text-xs flex-1" />
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={extra?.onOpenMediaPicker}>
                <ImageIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <PropField label="Alt Text" value={props.alt} onChange={v => updateProp('alt', v)} />
          <PropField label="Caption" value={props.caption} onChange={v => updateProp('caption', v)} />
          <PropField label="Border Radius" value={props.borderRadius} onChange={v => updateProp('borderRadius', v)} />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Fit Mode</Label>
            <Select value={props.objectFit || 'contain'} onValueChange={v => updateProp('objectFit', v)}>
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'button':
      return (
        <>
          <PropField label="Text" value={props.text} onChange={v => updateProp('text', v)} />
          <PropField label="URL" value={props.url} onChange={v => updateProp('url', v)} />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Style</Label>
            <Select value={props.style} onValueChange={v => updateProp('style', v)}>
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Navy</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'spacer':
      return <PropField label="Height" value={props.height} onChange={v => updateProp('height', v)} placeholder="e.g. 40px" />;

    case 'divider':
      return (
        <>
          <PropField label="Thickness" value={props.thickness} onChange={v => updateProp('thickness', v)} />
          <PropField label="Width" value={props.width} onChange={v => updateProp('width', v)} />
          <PropField label="Color" value={props.color} onChange={v => updateProp('color', v)} placeholder="CSS color" />
        </>
      );

    case 'section':
      return (
        <>
          <PropField label="Background" value={props.background} onChange={v => updateProp('background', v)} placeholder="CSS color or gradient" />
          <PropField label="Background Image" value={props.backgroundImage} onChange={v => updateProp('backgroundImage', v)} placeholder="URL" />
          <PropField label="Max Width" value={props.maxWidth} onChange={v => updateProp('maxWidth', v)} />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Full Width</Label>
            <Switch checked={props.fullWidth} onCheckedChange={v => updateProp('fullWidth', v)} />
          </div>
          <Separator className="my-2" />
          <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Grid Layout</p>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1">
              {LAYOUT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => updateProp('gridColumns', preset.gridColumns)}
                  className={`p-1.5 rounded border text-[9px] transition-colors ${
                    props.gridColumns === preset.gridColumns
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                  title={preset.label}
                >
                  <div
                    className="w-full h-4 rounded overflow-hidden mb-0.5"
                    style={{ display: 'grid', gridTemplateColumns: preset.gridColumns, gap: '1px' }}
                  >
                    {preset.gridColumns.split(' ').map((_, i) => (
                      <div key={i} className="bg-current rounded-sm opacity-30" />
                    ))}
                  </div>
                  <span className="leading-none">{preset.label}</span>
                </button>
              ))}
            </div>
            <PropField label="Grid Columns (custom)" value={props.gridColumns} onChange={v => updateProp('gridColumns', v)} placeholder="e.g. 1fr 2fr 1fr" />
            <PropField label="Column Gap" value={props.columnGap} onChange={v => updateProp('columnGap', v)} placeholder="e.g. 1.5rem" />
            <PropField label="Row Gap" value={props.rowGap} onChange={v => updateProp('rowGap', v)} placeholder="e.g. 1.5rem" />
          </div>
        </>
      );

    case 'column':
      return (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Vertical Align</Label>
            <Select value={props.verticalAlign || 'flex-start'} onValueChange={v => updateProp('verticalAlign', v)}>
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flex-start">Top</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="flex-end">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'grid':
      return (
        <>
          <PropField label="Columns" value={String(props.gridCols)} onChange={v => updateProp('gridCols', parseInt(v) || 2)} />
          <PropField label="Rows" value={String(props.gridRows)} onChange={v => updateProp('gridRows', parseInt(v) || 2)} />
          <PropField label="Column Gap" value={props.columnGap} onChange={v => updateProp('columnGap', v)} placeholder="e.g. 1rem" />
          <PropField label="Row Gap" value={props.rowGap} onChange={v => updateProp('rowGap', v)} placeholder="e.g. 1rem" />
        </>
      );

    case 'blog-loop':
      return (
        <>
          <PropField label="Count" value={String(props.count)} onChange={v => updateProp('count', parseInt(v) || 3)} />
          <PropField label="Columns" value={String(props.columns)} onChange={v => updateProp('columns', parseInt(v) || 3)} />
          <PropField label="Category" value={props.category} onChange={v => updateProp('category', v)} placeholder="Filter by category" />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Image</Label>
            <Switch checked={props.showImage} onCheckedChange={v => updateProp('showImage', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Excerpt</Label>
            <Switch checked={props.showExcerpt} onCheckedChange={v => updateProp('showExcerpt', v)} />
          </div>
        </>
      );

    case 'service-loop':
      return (
        <>
          <PropField label="Count" value={String(props.count)} onChange={v => updateProp('count', parseInt(v) || 6)} />
          <PropField label="Columns" value={String(props.columns)} onChange={v => updateProp('columns', parseInt(v) || 3)} />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Image</Label>
            <Switch checked={props.showImage} onCheckedChange={v => updateProp('showImage', v)} />
          </div>
        </>
      );

    case 'faq':
      return (
        <div className="space-y-2">
          {(props.items || []).map((item: any, i: number) => (
            <div key={i} className="border border-border rounded p-2 space-y-1">
              <PropField label={`Q${i + 1}`} value={item.question} onChange={v => {
                const items = [...props.items];
                items[i] = { ...items[i], question: v };
                updateProp('items', items);
              }} />
              <PropField label={`A${i + 1}`} value={item.answer} onChange={v => {
                const items = [...props.items];
                items[i] = { ...items[i], answer: v };
                updateProp('items', items);
              }} multiline />
              <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={() => {
                const items = props.items.filter((_: any, idx: number) => idx !== i);
                updateProp('items', items);
              }}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => {
            updateProp('items', [...(props.items || []), { question: '', answer: '' }]);
          }}>+ Add FAQ Item</Button>
        </div>
      );

    case 'testimonial':
      return (
        <>
          <PropField label="Quote" value={props.quote} onChange={v => updateProp('quote', v)} multiline />
          <PropField label="Author" value={props.author} onChange={v => updateProp('author', v)} />
          <PropField label="Role" value={props.role} onChange={v => updateProp('role', v)} />
        </>
      );

    case 'html-embed':
      return <PropField label="HTML" value={props.html} onChange={v => updateProp('html', v)} multiline />;

    case 'legacy-content':
      return (
        <>
          <PropField label="HTML Content" value={props.html} onChange={v => updateProp('html', v)} multiline />
          <PropField label="Source Table" value={props.sourceTable} onChange={v => updateProp('sourceTable', v)} placeholder="e.g. blog_posts" />
          <PropField label="Source ID" value={props.sourceId} onChange={v => updateProp('sourceId', v)} />
        </>
      );

    case 'video':
      return (
        <>
          <PropField label="Video URL" value={props.url} onChange={v => updateProp('url', v)} placeholder="YouTube, Vimeo, or direct URL" />
          <PropField label="Aspect Ratio" value={props.aspectRatio} onChange={v => updateProp('aspectRatio', v)} placeholder="16/9" />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Autoplay</Label>
            <Switch checked={props.autoplay} onCheckedChange={v => updateProp('autoplay', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Loop</Label>
            <Switch checked={props.loop} onCheckedChange={v => updateProp('loop', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Muted</Label>
            <Switch checked={props.muted} onCheckedChange={v => updateProp('muted', v)} />
          </div>
        </>
      );

    case 'icon':
      return (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Icon</Label>
            <Select value={props.icon || 'Star'} onValueChange={v => updateProp('icon', v)}>
              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="Star">⭐ Star</SelectItem>
                <SelectItem value="Heart">❤️ Heart</SelectItem>
                <SelectItem value="Check">✓ Check</SelectItem>
                <SelectItem value="Phone">📞 Phone</SelectItem>
                <SelectItem value="Mail">✉️ Mail</SelectItem>
                <SelectItem value="Home">🏠 Home</SelectItem>
                <SelectItem value="ArrowRight">→ Arrow</SelectItem>
                <SelectItem value="Tooth">🦷 Tooth</SelectItem>
                <SelectItem value="Smile">😊 Smile</SelectItem>
                <SelectItem value="Shield">🛡️ Shield</SelectItem>
                <SelectItem value="Clock">🕐 Clock</SelectItem>
                <SelectItem value="Calendar">📅 Calendar</SelectItem>
                <SelectItem value="Sparkles">✨ Sparkles</SelectItem>
                <SelectItem value="Syringe">💉 Syringe</SelectItem>
                <SelectItem value="Stethoscope">🩺 Stethoscope</SelectItem>
                <SelectItem value="Award">🏆 Award</SelectItem>
                <SelectItem value="Users">👥 Users</SelectItem>
                <SelectItem value="MapPin">📍 Location</SelectItem>
                <SelectItem value="ThumbsUp">👍 Thumbs Up</SelectItem>
                <SelectItem value="Eye">👁️ Eye</SelectItem>
                <SelectItem value="Baby">👶 Baby</SelectItem>
                <SelectItem value="Pill">💊 Pill</SelectItem>
                <SelectItem value="Xray">🔬 X-Ray</SelectItem>
                <SelectItem value="Clipboard">📋 Clipboard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropField label="Size" value={props.size} onChange={v => updateProp('size', v)} placeholder="48px" />
          <PropField label="Color" value={props.color} onChange={v => updateProp('color', v)} placeholder="CSS color" />
        </>
      );

    case 'google-map':
      return (
        <>
          <PropField label="Address" value={props.address} onChange={v => updateProp('address', v)} />
          <PropField label="Zoom" value={String(props.zoom)} onChange={v => updateProp('zoom', parseInt(v) || 14)} />
          <PropField label="Height" value={props.height} onChange={v => updateProp('height', v)} placeholder="300px" />
        </>
      );

    case 'tabs':
      return (
        <div className="space-y-2">
          {(props.items || []).map((item: any, i: number) => (
            <div key={i} className="border border-border rounded p-2 space-y-1">
              <PropField label={`Tab ${i + 1} Title`} value={item.title} onChange={v => {
                const items = [...props.items]; items[i] = { ...items[i], title: v }; updateProp('items', items);
              }} />
              <PropField label={`Content`} value={item.content} onChange={v => {
                const items = [...props.items]; items[i] = { ...items[i], content: v }; updateProp('items', items);
              }} multiline />
              <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={() => {
                updateProp('items', props.items.filter((_: any, idx: number) => idx !== i));
              }}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => {
            updateProp('items', [...(props.items || []), { title: 'New Tab', content: '' }]);
          }}>+ Add Tab</Button>
        </div>
      );

    case 'accordion':
      return (
        <div className="space-y-2">
          {(props.items || []).map((item: any, i: number) => (
            <div key={i} className="border border-border rounded p-2 space-y-1">
              <PropField label={`Title ${i + 1}`} value={item.title} onChange={v => {
                const items = [...props.items]; items[i] = { ...items[i], title: v }; updateProp('items', items);
              }} />
              <PropField label={`Content`} value={item.content} onChange={v => {
                const items = [...props.items]; items[i] = { ...items[i], content: v }; updateProp('items', items);
              }} multiline />
              <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={() => {
                updateProp('items', props.items.filter((_: any, idx: number) => idx !== i));
              }}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => {
            updateProp('items', [...(props.items || []), { title: 'New Item', content: '' }]);
          }}>+ Add Item</Button>
        </div>
      );

    case 'image-box':
      return (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Image URL</Label>
            <div className="flex gap-1">
              <Input value={props.src || ''} onChange={e => updateProp('src', e.target.value)} placeholder="https://..." className="h-7 text-xs flex-1" />
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={extra?.onOpenMediaPicker}>
                <ImageIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <PropField label="Title" value={props.title} onChange={v => updateProp('title', v)} />
          <PropField label="Description" value={props.description} onChange={v => updateProp('description', v)} multiline />
        </>
      );

    case 'icon-box':
      return (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Icon</Label>
            <Select value={props.icon || 'Star'} onValueChange={v => updateProp('icon', v)}>
              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Star', 'Heart', 'Check', 'Phone', 'Mail', 'Home', 'ArrowRight'].map(ic => (
                  <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PropField label="Icon Color" value={props.iconColor} onChange={v => updateProp('iconColor', v)} placeholder="CSS color" />
          <PropField label="Title" value={props.title} onChange={v => updateProp('title', v)} />
          <PropField label="Description" value={props.description} onChange={v => updateProp('description', v)} multiline />
        </>
      );

    case 'image-carousel':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Autoplay</Label>
            <Switch checked={props.autoplay} onCheckedChange={v => updateProp('autoplay', v)} />
          </div>
          <PropField label="Interval (ms)" value={String(props.interval || 3000)} onChange={v => updateProp('interval', parseInt(v) || 3000)} />
          {(props.images || []).map((img: any, i: number) => (
            <div key={i} className="border border-border rounded p-2 space-y-1">
              <div className="flex gap-1">
                <Input value={img.src || ''} onChange={e => {
                  const images = [...props.images]; images[i] = { ...images[i], src: e.target.value }; updateProp('images', images);
                }} placeholder="Image URL" className="h-7 text-xs flex-1" />
              </div>
              <Input value={img.alt || ''} onChange={e => {
                const images = [...props.images]; images[i] = { ...images[i], alt: e.target.value }; updateProp('images', images);
              }} placeholder="Alt text" className="h-7 text-xs" />
              <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={() => {
                updateProp('images', props.images.filter((_: any, idx: number) => idx !== i));
              }}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => {
            updateProp('images', [...(props.images || []), { src: '', alt: '' }]);
          }}>+ Add Image</Button>
        </div>
      );

    case 'gallery':
      return (
        <div className="space-y-2">
          <PropField label="Columns" value={String(props.columns || 3)} onChange={v => updateProp('columns', parseInt(v) || 3)} />
          <PropField label="Gap" value={props.gap} onChange={v => updateProp('gap', v)} placeholder="0.5rem" />
          {(props.images || []).map((img: any, i: number) => (
            <div key={i} className="border border-border rounded p-2 space-y-1">
              <Input value={img.src || ''} onChange={e => {
                const images = [...props.images]; images[i] = { ...images[i], src: e.target.value }; updateProp('images', images);
              }} placeholder="Image URL" className="h-7 text-xs" />
              <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={() => {
                updateProp('images', props.images.filter((_: any, idx: number) => idx !== i));
              }}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => {
            updateProp('images', [...(props.images || []), { src: '', alt: '' }]);
          }}>+ Add Image</Button>
        </div>
      );

    case 'social-icons':
      return (
        <div className="space-y-2">
          <PropField label="Icon Size" value={props.size} onChange={v => updateProp('size', v)} placeholder="24px" />
          {(props.icons || []).map((s: any, i: number) => (
            <div key={i} className="border border-border rounded p-2 space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Platform</Label>
                <Select value={s.platform} onValueChange={v => {
                  const icons = [...props.icons]; icons[i] = { ...icons[i], platform: v }; updateProp('icons', icons);
                }}>
                  <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'whatsapp'].map(p => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input value={s.url || ''} onChange={e => {
                const icons = [...props.icons]; icons[i] = { ...icons[i], url: e.target.value }; updateProp('icons', icons);
              }} placeholder="URL" className="h-7 text-xs" />
              <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={() => {
                updateProp('icons', props.icons.filter((_: any, idx: number) => idx !== i));
              }}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => {
            updateProp('icons', [...(props.icons || []), { platform: 'facebook', url: '#' }]);
          }}>+ Add Social Icon</Button>
        </div>
      );

    case 'icon-list':
      return (
        <div className="space-y-2">
          {(props.items || []).map((item: any, i: number) => (
            <div key={i} className="border border-border rounded p-2 space-y-1">
              <PropField label={`Item ${i + 1}`} value={item.text} onChange={v => {
                const items = [...props.items]; items[i] = { ...items[i], text: v }; updateProp('items', items);
              }} />
              <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={() => {
                updateProp('items', props.items.filter((_: any, idx: number) => idx !== i));
              }}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => {
            updateProp('items', [...(props.items || []), { icon: 'Check', text: 'New item' }]);
          }}>+ Add Item</Button>
        </div>
      );

    case 'contact-form':
      return (
        <div className="space-y-2">
          <PropField label="Submit Button Text" value={props.submitText} onChange={v => updateProp('submitText', v)} />
          {(props.fields || []).map((field: any, i: number) => (
            <div key={i} className="border border-border rounded p-2 space-y-1">
              <PropField label="Label" value={field.label} onChange={v => {
                const fields = [...props.fields]; fields[i] = { ...fields[i], label: v }; updateProp('fields', fields);
              }} />
              <div className="flex items-center justify-between">
                <Label className="text-xs">Type</Label>
                <Select value={field.type} onValueChange={v => {
                  const fields = [...props.fields]; fields[i] = { ...fields[i], type: v }; updateProp('fields', fields);
                }}>
                  <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="tel">Phone</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Required</Label>
                <Switch checked={field.required} onCheckedChange={v => {
                  const fields = [...props.fields]; fields[i] = { ...fields[i], required: v }; updateProp('fields', fields);
                }} />
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={() => {
                updateProp('fields', props.fields.filter((_: any, idx: number) => idx !== i));
              }}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => {
            updateProp('fields', [...(props.fields || []), { type: 'text', label: 'New Field', required: false }]);
          }}>+ Add Field</Button>
        </div>
      );

    default:
      return <p className="text-xs text-muted-foreground">No editable properties</p>;
  }
}

export default PropertiesPanel;
