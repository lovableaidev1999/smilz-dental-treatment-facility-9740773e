import { ChevronRight, ChevronDown, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useBuilder } from '@/hooks/useBuilderState';
import { getBlockDefinition, getBlockIcon } from './block-registry';
import type { LayoutNode } from '@/types/visual-builder';

const LayerItem = ({ node, depth = 0 }: { node: LayoutNode; depth?: number }) => {
  const [expanded, setExpanded] = useState(true);
  const { state, dispatch } = useBuilder();
  const def = getBlockDefinition(node.type);
  const Icon = def ? getBlockIcon(def) : null;
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = state.selectedBlockId === node.id;
  const isHovered = state.hoveredBlockId === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 text-xs cursor-pointer rounded transition-colors ${
          isSelected ? 'bg-primary/10 text-primary' : isHovered ? 'bg-muted' : 'hover:bg-muted/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => dispatch({ type: 'SELECT_BLOCK', payload: node.id })}
        onMouseEnter={() => dispatch({ type: 'HOVER_BLOCK', payload: node.id })}
        onMouseLeave={() => dispatch({ type: 'HOVER_BLOCK', payload: null })}
      >
        {hasChildren ? (
          <button
            onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-0.5"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        {Icon && <Icon className="h-3 w-3 shrink-0" />}
        <span className="truncate flex-1">
          {node.props?.text?.slice(0, 20) || def?.label || node.type}
        </span>
        <button
          onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_BLOCK', payload: node.id }); }}
          className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <LayerItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const LayersPanel = () => {
  const { state } = useBuilder();

  return (
    <div className="p-3 overflow-y-auto h-full">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Layers</h3>
      {state.layout.length === 0 ? (
        <p className="text-xs text-muted-foreground">No blocks yet. Drag blocks from the palette.</p>
      ) : (
        <div className="space-y-0.5">
          {state.layout.map(node => (
            <LayerItem key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LayersPanel;
