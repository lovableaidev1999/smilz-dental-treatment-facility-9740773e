import { useState, useCallback, useEffect } from 'react';
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
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';
import { BuilderProvider, useBuilder } from '@/hooks/useBuilderState';
import { usePageLayoutById, useSavePageLayout } from '@/hooks/usePageLayouts';
import { getBlockDefinition, getBlockIcon } from '@/components/builder/block-registry';
import BuilderTopBar from '@/components/builder/BuilderTopBar';
import BlockPalette from '@/components/builder/BlockPalette';
import LayersPanel from '@/components/builder/LayersPanel';
import BuilderCanvas from '@/components/builder/BuilderCanvas';
import PropertiesPanel from '@/components/builder/PropertiesPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Blocks, Layers } from 'lucide-react';
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.fromPalette) {
      setActiveDragType(data.blockType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // From palette → canvas
    if (activeData?.fromPalette) {
      const blockType = activeData.blockType as BlockType;
      // Determine target container
      let targetParentId: string | null = null;
      if (overData?.containerId !== undefined) {
        targetParentId = overData.containerId;
      } else if (overData?.parentId !== undefined) {
        targetParentId = overData.parentId;
      }
      addBlock(blockType, targetParentId);
      return;
    }

    // Reorder within canvas
    if (activeData?.blockId && !activeData.fromPalette) {
      const activeId = activeData.blockId;
      const overId = over.id as string;
      if (activeId === overId) return;

      // Find positions and reorder
      const overContainerId = overData?.containerId ?? overData?.parentId ?? null;
      const activeParentId = activeData.parentId;

      if (activeParentId === overContainerId || overContainerId === null) {
        // Same parent → reorder
        dispatch({
          type: 'MOVE_BLOCK',
          payload: {
            blockId: activeId,
            targetParentId: overContainerId,
            targetIndex: 0, // Will be adjusted by the tree logic
          },
        });
      } else {
        // Different parent → move
        dispatch({
          type: 'MOVE_BLOCK',
          payload: {
            blockId: activeId,
            targetParentId: overContainerId,
            targetIndex: 0,
          },
        });
      }
    }
  };

  const handleSave = async (publish = false) => {
    try {
      const result = await saveLayout.mutateAsync({
        id: layoutId,
        page_slug: pageSlug,
        page_title: pageTitle,
        layout_json: state.layout,
        is_published: publish,
      });
      dispatch({ type: 'MARK_SAVED' });
      toast({
        title: publish ? 'Published!' : 'Saved!',
        description: publish ? 'Your page is now live.' : 'Draft saved successfully.',
      });
      // If this was a new layout, redirect to include the ID
      if (!layoutId && result.id) {
        navigate(`/admin/page-builder/${result.id}`, { replace: true });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <BuilderTopBar
          pageTitle={pageTitle}
          onSave={() => handleSave(false)}
          onPublish={() => handleSave(true)}
          onPreview={() => window.open(`/preview/${pageSlug}`, '_blank')}
          onBack={() => navigate('/admin/pages')}
          saving={saveLayout.isPending}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-56 border-r border-border bg-card shrink-0 overflow-hidden flex flex-col">
            <Tabs defaultValue="blocks" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b h-9 bg-transparent p-0">
                <TabsTrigger value="blocks" className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <Blocks className="h-3.5 w-3.5 mr-1" /> Blocks
                </TabsTrigger>
                <TabsTrigger value="layers" className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <Layers className="h-3.5 w-3.5 mr-1" /> Layers
                </TabsTrigger>
              </TabsList>
              <TabsContent value="blocks" className="flex-1 overflow-auto mt-0">
                <BlockPalette />
              </TabsContent>
              <TabsContent value="layers" className="flex-1 overflow-auto mt-0">
                <LayersPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* Center Canvas */}
          <BuilderCanvas />

          {/* Right Panel */}
          <div className="w-64 border-l border-border bg-card shrink-0 overflow-hidden">
            <div className="h-9 border-b border-border flex items-center px-3">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Properties</span>
            </div>
            <div className="overflow-y-auto" style={{ height: 'calc(100% - 36px)' }}>
              <PropertiesPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
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
    </DndContext>
  );
};

// ─── Page wrapper ───────────────────────────────────────
const AdminPageBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const pageSlug = searchParams.get('slug') || 'new-page';
  const pageTitleParam = searchParams.get('title') || 'New Page';

  const { data: existingLayout, isLoading } = usePageLayoutById(id || '');

  if (id && isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading builder...</div>
      </div>
    );
  }

  const initialLayout = existingLayout?.layout_json || [];
  const pageTitle = existingLayout?.page_title || pageTitleParam;
  const slug = existingLayout?.page_slug || pageSlug;

  return (
    <BuilderProvider initialLayout={initialLayout}>
      <BuilderInner layoutId={id} pageSlug={slug} pageTitle={pageTitle} />
    </BuilderProvider>
  );
};

export default AdminPageBuilder;
