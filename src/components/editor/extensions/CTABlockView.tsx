import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CTABlockView = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
  const { text, url, style } = node.attrs;

  return (
    <NodeViewWrapper className={`my-4 relative group rounded-xl border-2 p-4 transition-colors ${selected ? "border-primary" : "border-border"}`}>
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={deleteNode}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-xs font-medium text-muted-foreground mb-3">CTA Button Block</p>

      {/* Preview */}
      <div className="flex justify-center mb-4">
        <span
          className={`inline-block px-8 py-3 rounded-lg font-semibold text-sm transition-colors ${
            style === "gold"
              ? "bg-[hsl(var(--dental-gold))] text-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {text || "Button Text"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          value={text}
          onChange={(e) => updateAttributes({ text: e.target.value })}
          placeholder="Button text"
          className="text-xs h-8"
        />
        <Input
          value={url}
          onChange={(e) => updateAttributes({ url: e.target.value })}
          placeholder="Link URL"
          className="text-xs h-8 font-mono"
        />
      </div>
      <div className="flex gap-2 mt-2">
        {(["navy", "gold"] as const).map((s) => (
          <button
            key={s}
            onClick={() => updateAttributes({ style: s })}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              style === s
                ? s === "gold"
                  ? "bg-[hsl(var(--dental-gold))] text-foreground"
                  : "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {s === "navy" ? "Navy" : "Gold"}
          </button>
        ))}
      </div>
    </NodeViewWrapper>
  );
};

export default CTABlockView;
