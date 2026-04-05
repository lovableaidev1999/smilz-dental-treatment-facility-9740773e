import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { BuilderState, BuilderAction, LayoutNode, DeviceMode, ResponsiveProps } from '@/types/visual-builder';

// ─── Tree helpers ────────────────────────────────────────
const generateId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const findNodeById = (nodes: LayoutNode[], id: string): LayoutNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findParent = (nodes: LayoutNode[], id: string): { parent: LayoutNode[]; index: number } | null => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { parent: nodes, index: i };
    if (nodes[i].children) {
      const found = findParent(nodes[i].children!, id);
      if (found) return found;
    }
  }
  return null;
};

const removeNode = (nodes: LayoutNode[], id: string): LayoutNode[] => {
  return nodes
    .filter(n => n.id !== id)
    .map(n => n.children ? { ...n, children: removeNode(n.children, id) } : n);
};

const insertNode = (nodes: LayoutNode[], block: LayoutNode, parentId: string | null, index?: number): LayoutNode[] => {
  if (!parentId) {
    const idx = index ?? nodes.length;
    const copy = [...nodes];
    copy.splice(idx, 0, block);
    return copy;
  }
  return nodes.map(n => {
    if (n.id === parentId) {
      const children = [...(n.children || [])];
      const idx = index ?? children.length;
      children.splice(idx, 0, block);
      return { ...n, children };
    }
    if (n.children) return { ...n, children: insertNode(n.children, block, parentId, index) };
    return n;
  });
};

const updateNodeProps = (nodes: LayoutNode[], id: string, props: Record<string, any>): LayoutNode[] => {
  return nodes.map(n => {
    if (n.id === id) return { ...n, props: { ...n.props, ...props } };
    if (n.children) return { ...n, children: updateNodeProps(n.children, id, props) };
    return n;
  });
};

const updateNodeResponsive = (nodes: LayoutNode[], id: string, device: DeviceMode, props: ResponsiveProps): LayoutNode[] => {
  return nodes.map(n => {
    if (n.id === id) {
      return {
        ...n,
        responsive: {
          ...n.responsive,
          [device]: { ...(n.responsive?.[device] || {}), ...props },
        },
      };
    }
    if (n.children) return { ...n, children: updateNodeResponsive(n.children, id, device, props) };
    return n;
  });
};

// ─── Reducer ─────────────────────────────────────────────
const initialState: BuilderState = {
  layout: [],
  selectedBlockId: null,
  hoveredBlockId: null,
  deviceMode: 'desktop',
  isDirty: false,
  showLayers: true,
  clipboardBlock: null,
};

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_LAYOUT':
      return { ...state, layout: action.payload, isDirty: false, selectedBlockId: null };

    case 'ADD_BLOCK': {
      const { block, parentId, index } = action.payload;
      return { ...state, layout: insertNode(state.layout, block, parentId, index), isDirty: true, selectedBlockId: block.id };
    }

    case 'MOVE_BLOCK': {
      const { blockId, targetParentId, targetIndex } = action.payload;
      const node = findNodeById(state.layout, blockId);
      if (!node) return state;
      // Prevent moving locked blocks
      if (node.props?.locked) return state;
      const clone = deepClone(node);
      const without = removeNode(state.layout, blockId);
      return { ...state, layout: insertNode(without, clone, targetParentId, targetIndex), isDirty: true };
    }

    case 'UPDATE_BLOCK_PROPS':
      return { ...state, layout: updateNodeProps(state.layout, action.payload.blockId, action.payload.props), isDirty: true };

    case 'UPDATE_RESPONSIVE':
      return {
        ...state,
        layout: updateNodeResponsive(state.layout, action.payload.blockId, action.payload.device, action.payload.props),
        isDirty: true,
      };

    case 'DELETE_BLOCK':
      return {
        ...state,
        layout: removeNode(state.layout, action.payload),
        isDirty: true,
        selectedBlockId: state.selectedBlockId === action.payload ? null : state.selectedBlockId,
      };

    case 'DUPLICATE_BLOCK': {
      const node = findNodeById(state.layout, action.payload);
      if (!node) return state;
      const clone = deepClone(node);
      const reassignIds = (n: LayoutNode): LayoutNode => ({
        ...n,
        id: generateId(),
        children: n.children?.map(reassignIds),
      });
      const duplicated = reassignIds(clone);
      const parentInfo = findParent(state.layout, action.payload);
      if (!parentInfo) return state;
      const parentNode = state.layout.find(n => findNodeById([n], action.payload));
      // Insert after the original
      const parentId = parentInfo.parent === state.layout ? null :
        (() => { /* find parent id */
          const findParentId = (nodes: LayoutNode[], id: string, pid: string | null): string | null => {
            for (const n of nodes) {
              if (n.id === id) return pid;
              if (n.children) {
                const found = findParentId(n.children, id, n.id);
                if (found !== undefined) return found;
              }
            }
            return undefined as any;
          };
          return findParentId(state.layout, action.payload, null);
        })();
      return {
        ...state,
        layout: insertNode(state.layout, duplicated, parentId, parentInfo.index + 1),
        isDirty: true,
        selectedBlockId: duplicated.id,
      };
    }

    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.payload };

    case 'HOVER_BLOCK':
      return { ...state, hoveredBlockId: action.payload };

    case 'SET_DEVICE':
      return { ...state, deviceMode: action.payload };

    case 'COPY_BLOCK': {
      const node = findNodeById(state.layout, action.payload);
      if (!node) return state;
      return { ...state, clipboardBlock: deepClone(node) };
    }

    case 'PASTE_BLOCK': {
      if (!state.clipboardBlock) return state;
      const reassignIds = (n: LayoutNode): LayoutNode => ({
        ...n,
        id: generateId(),
        children: n.children?.map(reassignIds),
      });
      const pasted = reassignIds(deepClone(state.clipboardBlock));
      return {
        ...state,
        layout: insertNode(state.layout, pasted, action.payload.parentId, action.payload.index),
        isDirty: true,
        selectedBlockId: pasted.id,
      };
    }

    case 'TOGGLE_LAYERS':
      return { ...state, showLayers: !state.showLayers };

    case 'MARK_SAVED':
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────
interface BuilderContextValue {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  addBlock: (type: string, parentId?: string | null, index?: number) => void;
  findNode: (id: string) => LayoutNode | null;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
};

// ─── Block factory (imported from registry lazily) ──────
import { getBlockDefinition } from '@/components/builder/block-registry';

export const BuilderProvider: React.FC<{ children: React.ReactNode; initialLayout?: LayoutNode[] }> = ({
  children,
  initialLayout,
}) => {
  const [state, dispatch] = useReducer(builderReducer, {
    ...initialState,
    layout: initialLayout || [],
  });

  const addBlock = useCallback((type: string, parentId: string | null = null, index?: number) => {
    const def = getBlockDefinition(type as any);
    if (!def) return;
    const block: LayoutNode = {
      id: generateId(),
      type: def.type,
      props: { ...def.defaultProps },
      children: def.defaultChildren ? deepClone(def.defaultChildren) : (def.canHaveChildren ? [] : undefined),
    };
    // Reassign IDs for default children
    if (block.children) {
      const reassign = (n: LayoutNode): LayoutNode => ({ ...n, id: generateId(), children: n.children?.map(reassign) });
      block.children = block.children.map(reassign);
    }
    dispatch({ type: 'ADD_BLOCK', payload: { block, parentId, index } });
  }, []);

  const findNode = useCallback((id: string) => findNodeById(state.layout, id), [state.layout]);

  return (
    <BuilderContext.Provider value={{ state, dispatch, addBlock, findNode }}>
      {children}
    </BuilderContext.Provider>
  );
};
