import type { LayoutNode } from '@/types/visual-builder';

/**
 * Replace {Placeholder} template variables in layout node props with actual data.
 * Recursively walks the entire layout tree.
 */
export const resolveTemplateVars = (layout: LayoutNode[], data: Record<string, any>): LayoutNode[] => {
  const resolve = (text: string): string => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined && data[key] !== null ? String(data[key]) : match;
    });
  };

  const walk = (nodes: LayoutNode[]): LayoutNode[] =>
    nodes.map(node => {
      const newProps = { ...node.props };
      for (const [k, v] of Object.entries(newProps)) {
        if (typeof v === 'string') newProps[k] = resolve(v);
        // Also resolve arrays of objects (e.g., FAQ items, icon-list items)
        if (Array.isArray(v)) {
          newProps[k] = v.map(item => {
            if (typeof item === 'object' && item !== null) {
              const resolved: Record<string, any> = { ...item };
              for (const [ik, iv] of Object.entries(resolved)) {
                if (typeof iv === 'string') resolved[ik] = resolve(iv);
              }
              return resolved;
            }
            return typeof item === 'string' ? resolve(item) : item;
          });
        }
      }
      return {
        ...node,
        props: newProps,
        children: node.children ? walk(node.children) : undefined,
      };
    });

  return walk(layout);
};
