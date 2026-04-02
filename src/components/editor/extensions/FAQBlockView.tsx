import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, HelpCircle } from "lucide-react";
import type { FAQItem } from "./FAQBlockExtension";

const FAQBlockView = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
  const items: FAQItem[] = node.attrs.items || [];

  const update = (index: number, field: keyof FAQItem, value: string) => {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    updateAttributes({ items: next });
  };

  const addItem = () => updateAttributes({ items: [...items, { question: "", answer: "" }] });

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    updateAttributes({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <NodeViewWrapper className={`my-4 relative group rounded-xl border-2 p-4 transition-colors ${selected ? "border-primary" : "border-border"}`}>
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={deleteNode}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium text-muted-foreground">FAQ Block (SEO Accordion)</p>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-secondary/50 rounded-lg p-3 space-y-2">
            <div className="flex gap-2 items-start">
              <span className="text-xs font-bold text-primary mt-2 shrink-0">Q{i + 1}</span>
              <Input
                value={item.question}
                onChange={(e) => update(i, "question", e.target.value)}
                placeholder="Question"
                className="text-sm h-8 flex-1"
              />
              {items.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeItem(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <Textarea
              value={item.answer}
              onChange={(e) => update(i, "answer", e.target.value)}
              placeholder="Answer"
              rows={2}
              className="text-xs"
            />
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs" onClick={addItem}>
        <Plus className="h-3.5 w-3.5" /> Add FAQ Item
      </Button>
    </NodeViewWrapper>
  );
};

export default FAQBlockView;
