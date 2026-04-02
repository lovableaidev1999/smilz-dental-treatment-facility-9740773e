import { useCallback, useRef } from 'react';
import type { LayoutNode } from '@/types/visual-builder';

const MAX_HISTORY = 50;

export interface UndoRedoHandle {
  pushState: (layout: LayoutNode[]) => void;
  undo: () => LayoutNode[] | null;
  redo: () => LayoutNode[] | null;
  canUndo: boolean;
  canRedo: boolean;
}

export const useUndoRedo = (): UndoRedoHandle => {
  const pastRef = useRef<LayoutNode[][]>([]);
  const futureRef = useRef<LayoutNode[][]>([]);
  const canUndoRef = useRef(false);
  const canRedoRef = useRef(false);

  const pushState = useCallback((layout: LayoutNode[]) => {
    pastRef.current = [...pastRef.current.slice(-MAX_HISTORY), JSON.parse(JSON.stringify(layout))];
    futureRef.current = [];
    canUndoRef.current = pastRef.current.length > 1;
    canRedoRef.current = false;
  }, []);

  const undo = useCallback((): LayoutNode[] | null => {
    if (pastRef.current.length <= 1) return null;
    const current = pastRef.current.pop()!;
    futureRef.current.push(current);
    const prev = pastRef.current[pastRef.current.length - 1];
    canUndoRef.current = pastRef.current.length > 1;
    canRedoRef.current = true;
    return JSON.parse(JSON.stringify(prev));
  }, []);

  const redo = useCallback((): LayoutNode[] | null => {
    if (futureRef.current.length === 0) return null;
    const next = futureRef.current.pop()!;
    pastRef.current.push(next);
    canUndoRef.current = true;
    canRedoRef.current = futureRef.current.length > 0;
    return JSON.parse(JSON.stringify(next));
  }, []);

  return {
    pushState,
    undo,
    redo,
    get canUndo() { return canUndoRef.current; },
    get canRedo() { return canRedoRef.current; },
  };
};
