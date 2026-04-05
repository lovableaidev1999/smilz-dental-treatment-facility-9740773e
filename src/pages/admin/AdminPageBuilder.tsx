import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';
import { BuilderProvider, useBuilder } from '@/hooks/useBuilderState';
import { usePageLayoutById, useSavePageLayout } from '@/hooks/usePageLayouts';
import { getBlockDefinition, getBlockIcon } from '@/components/builder/block-registry';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import BuilderTopBar from '@/components/builder/BuilderTopBar';
import BlockPalette from '@/components/builder/BlockPalette';
import LayersPanel from '@/components/builder/LayersPanel';
import BuilderCanvas from '@/components/builder/BuilderCanvas';
import PropertiesPanel from '@/components/builder/PropertiesPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Blocks, Layers, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Settings } from 'lucide-react';
import type { BlockType, LayoutNode } from '@/types/visual-builder';

// ─── Inner builder with DnD ─────────────────────────────
const BuilderInner = ({ layoutId, pageSlug, pageTitle: initialTitle }: {
  layoutId?: string;
  pageSlug: string;
  pageTitle: string;
}) => {
  const { state, dispatch, addBlock } = useBuilder();
  const { toast } = useToast();
  const navigate = useNavigate();
  const saveLayout = useSavePageLayout();
  const [pageTitle, setPageTitle] = useState(initialTitle);
  const [activeDragType, setActiveDragType] = useState<BlockType | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showSeoDialog, setShowSeoDialog] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  const undoRedo = useUndoRedo();
  const prevLayoutRef = useRef<string>('');

  // Track layout changes for undo/redo
  useEffect(() => {
    const serialized = JSON.stringify(state.layout);
    if (serialized !== prevLayoutRef.current) {
      prevLayoutRef.current = serialized;
      undoRedo.pushState(state.layout);
    }
  }, [state.layout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const prev = undoRedo.undo();
        if (prev) dispatch({ type: 'SET_LAYOUT', payload: prev });
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const next = undoRedo.redo();
        if (next) dispatch({ type: 'SET_LAYOUT', payload: next });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && state.selectedBlockId) {
        dispatch({ type: 'COPY_BLOCK', payload: state.selectedBlockId });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && state.clipboardBlock) {
        dispatch({ type: 'PASTE_BLOCK', payload: { parentId: null } });
      }
      if (e.key === 'Delete' && state.selectedBlockId) {
        dispatch({ type: 'DELETE_BLOCK', payload: state.selectedBlockId });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.selectedBlockId, state.clipboardBlock, undoRedo, dispatch]);

  const handleUndo = () => {
    const prev = undoRedo.undo();
    if (prev) dispatch({ type: 'SET_LAYOUT', payload: prev });
  };
  const handleRedo = () => {
    const next = undoRedo.redo();
    if (next) dispatch({ type: 'SET_LAYOUT', payload: next });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.fromPalette) setActiveDragType(data.blockType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.fromPalette) {
      const blockType = activeData.blockType as BlockType;
      let targetParentId: string | null = null;
      if (overData?.containerId !== undefined) targetParentId = overData.containerId;
      else if (overData?.parentId !== undefined) targetParentId = overData.parentId;
      addBlock(blockType, targetParentId);
      return;
    }

    if (activeData?.blockId && !activeData.fromPalette) {
      const activeId = activeData.blockId;
      const overId = over.id as string;
      if (activeId === overId) return;
      const overContainerId = overData?.containerId ?? overData?.parentId ?? null;
      dispatch({
        type: 'MOVE_BLOCK',
        payload: { blockId: activeId, targetParentId: overContainerId, targetIndex: 0 },
      });
    }
  };

  const CORE_SLUGS = ['home', 'about', 'services', 'contact', 'blog', 'gallery'];

  const handleSave = async (publish = false) => {
    try {
      // Block count warning
      const countBlocks = (nodes: LayoutNode[]): number => nodes.reduce((sum, n) => sum + 1 + (n.children ? countBlocks(n.children) : 0), 0);
      const blockCount = countBlocks(state.layout);
      if (blockCount > 30) {
        toast({ title: '⚠️ Performance Warning', description: `This page has ${blockCount} blocks. Consider reducing for better performance.`, variant: 'destructive' });
      }

      // Embed SEO metadata into layout_json
      const layoutToSave = [...state.layout] as any;
      (layoutToSave as any)._seo = { title: seoTitle, description: seoDescription, ogImage: seoOgImage };

      const result = await saveLayout.mutateAsync({
        id: layoutId,
        page_slug: pageSlug,
        page_title: pageTitle,
        layout_json: layoutToSave,
        is_published: publish,
      });
      dispatch({ type: 'MARK_SAVED' });
      toast({
        title: publish ? 'Published!' : 'Saved as draft!',
        description: publish ? 'Your page is now live.' : 'Draft saved successfully.',
      });
      if (!layoutId && result.id) {
        navigate(`/admin/page-builder/${result.id}`, { replace: true });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <BuilderTopBar
          pageTitle={pageTitle}
          pageSlug={pageSlug}
          onSave={() => handleSave(false)}
          onPublish={() => handleSave(true)}
          onPreview={() => window.open(`/preview/${pageSlug}`, '_blank')}
          onView={() => {
            const url = CORE_SLUGS.includes(pageSlug) ? `/${pageSlug === 'home' ? '' : pageSlug}` : `/p/${pageSlug}`;
            window.open(url, '_blank');
          }}
          onBack={() => navigate('/admin/page-layouts')}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoRedo.canUndo}
          canRedo={undoRedo.canRedo}
          saving={saveLayout.isPending}
        />

        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
          {/* Collapsible & Resizable left panel */}
          {leftPanelOpen ? (
            <>
              <ResizablePanel defaultSize={20} minSize={10} maxSize={25} className="bg-card border-r border-border">
                <div className="h-full flex flex-col overflow-hidden">
                  <Tabs defaultValue="blocks" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="w-full rounded-none border-b h-9 bg-transparent p-0 shrink-0">
                      <TabsTrigger value="blocks" className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary">
                        <Blocks className="h-3.5 w-3.5 mr-1" /> Blocks
                      </TabsTrigger>
                      <TabsTrigger value="layers" className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary">
                        <Layers className="h-3.5 w-3.5 mr-1" /> Layers
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="blocks" className="flex-1 overflow-y-auto mt-0 min-h-0">
                      <BlockPalette />
                    </TabsContent>
                    <TabsContent value="layers" className="flex-1 overflow-y-auto mt-0 min-h-0">
                      <LayersPanel />
                    </TabsContent>
                  </Tabs>
                  <button
                    onClick={() => setLeftPanelOpen(false)}
                    className="flex items-center justify-center gap-1 py-2 border-t border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                  >
                    <PanelLeftClose className="h-3.5 w-3.5" /> Collapse
                  </button>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          ) : (
            <div className="border-r border-border bg-card shrink-0 flex flex-col items-center py-2 px-1 gap-1">
              <button
                onClick={() => setLeftPanelOpen(true)}
                className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Expand panel"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Canvas */}
          <ResizablePanel defaultSize={leftPanelOpen && rightPanelOpen ? 60 : leftPanelOpen || rightPanelOpen ? 75 : 90} style={{ overflow: 'auto' }}>
            <BuilderCanvas />
          </ResizablePanel>

          {/* Right panel */}
          {rightPanelOpen ? (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card border-l border-border">
                <div className="h-full flex flex-col overflow-hidden">
                  <div className="h-9 border-b border-border flex items-center px-3 justify-between shrink-0">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Properties</span>
                    <button
                      onClick={() => setShowSeoDialog(true)}
                      className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      title="SEO Settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <PropertiesPanel />
                  </div>
                  <button
                    onClick={() => setRightPanelOpen(false)}
                    className="flex items-center justify-center gap-1 py-2 border-t border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                  >
                    <PanelRightClose className="h-3.5 w-3.5" /> Collapse
                  </button>
                </div>
              </ResizablePanel>
            </>
          ) : (
            <div className="border-l border-border bg-card shrink-0 flex flex-col items-center py-2 px-1 gap-1">
              <button
                onClick={() => setRightPanelOpen(true)}
                className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Expand properties"
              >
                <PanelRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </ResizablePanelGroup>
      </div>

      <DragOverlay>
        {activeDragType && (() => {
          const def = getBlockDefinition(activeDragType);
          if (!def) return null;
          const Icon = getBlockIcon(def);
          return (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg shadow-elevated text-sm font-medium">
              <Icon className="h-4 w-4" />
              {def.label}
            </div>
          );
        })()}
      </DragOverlay>

      {/* SEO Settings Dialog */}
      <Dialog open={showSeoDialog} onOpenChange={setShowSeoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SEO Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Page Title (SEO)</Label>
              <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Override page title for search engines" />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder="Brief description for search results (max 160 chars)" className="min-h-[80px]" />
              <p className="text-xs text-muted-foreground mt-1">{seoDescription.length}/160 characters</p>
            </div>
            <div>
              <Label>OG Image URL</Label>
              <Input value={seoOgImage} onChange={e => setSeoOgImage(e.target.value)} placeholder="https://... (1200x630 recommended)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSeoDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
};

// ─── Page wrapper ───────────────────────────────────────
const AdminPageBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const pageSlug = searchParams.get('slug') || 'new-page';
  const pageTitleParam = searchParams.get('title') || 'New Page';
  const hasTemplate = searchParams.get('template') === 'true';

  const { data: existingLayout, isLoading } = usePageLayoutById(id || '');

  if (id && isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading builder...</div>
      </div>
    );
  }

  // Load template from sessionStorage if creating new page with template
  let initialLayout = existingLayout?.layout_json || [];
  if (!id && hasTemplate) {
    try {
      const tmpl = sessionStorage.getItem('builder_template');
      if (tmpl) {
        initialLayout = JSON.parse(tmpl);
        sessionStorage.removeItem('builder_template');
      }
    } catch {}
  }

  const pageTitle = existingLayout?.page_title || pageTitleParam;
  const slug = existingLayout?.page_slug || pageSlug;

  return (
    <BuilderProvider initialLayout={initialLayout}>
      <BuilderInner layoutId={id} pageSlug={slug} pageTitle={pageTitle} />
    </BuilderProvider>
  );
};

export default AdminPageBuilder;
