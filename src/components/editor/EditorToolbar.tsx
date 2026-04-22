import { type Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3,
  Link, Quote, Minus, Undo, Redo, ImagePlus, MousePointerClick, HelpCircle,
  AlignLeft, AlignCenter, AlignRight, Palette, Highlighter,
} from "lucide-react";
import { useState } from "react";

interface Props {
  editor: Editor;
}

const ToolBtn = ({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant={active ? "secondary" : "ghost"}
    size="icon"
    className="h-8 w-8"
    onClick={onClick}
    title={title}
  >
    {children}
  </Button>
);

const EditorToolbar = ({ editor }: Props) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTarget, setLinkTarget] = useState<"_self" | "_blank">("_blank");

  const openLinkInput = () => {
    const existing = editor.getAttributes("link");
    setLinkUrl(existing.href || "");
    setLinkTarget(existing.target === "_self" ? "_self" : "_blank");
    setShowLinkInput(true);
  };

  const setLink = () => {
    if (linkUrl) {
      const rel = linkTarget === "_blank" ? "noopener noreferrer" : null;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl, target: linkTarget, rel } as any)
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const insertBlock = (type: string) => {
    const chain = editor.chain().focus();
    switch (type) {
      case "media":
        chain.insertContent({ type: "mediaBlock", attrs: { src: "", alt: "", caption: "" } }).run();
        break;
      case "cta":
        chain.insertContent({ type: "ctaBlock", attrs: { text: "Book Appointment", url: "/contact", style: "navy" } }).run();
        break;
      case "faq":
        chain.insertContent({ type: "faqBlock", attrs: { items: [{ question: "", answer: "" }] } }).run();
        break;
    }
  };

  return (
    <div className="border-b border-border bg-card px-2 py-1.5 flex flex-wrap items-center gap-0.5">
      {/* Text formatting */}
      <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
        <Bold className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
        <Italic className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </ToolBtn>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Headings */}
      <ToolBtn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        <Heading1 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        <Heading2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        <Heading3 className="h-4 w-4" />
      </ToolBtn>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Lists */}
      <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
        <List className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
        <ListOrdered className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
        <Quote className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        <Minus className="h-4 w-4" />
      </ToolBtn>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Alignment */}
      <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left">
        <AlignLeft className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center">
        <AlignCenter className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right">
        <AlignRight className="h-4 w-4" />
      </ToolBtn>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text Color */}
      <label
        className="relative h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer"
        title="Text color"
      >
        <Palette className="h-4 w-4" style={{ color: editor.getAttributes('textStyle').color || undefined }} />
        <input
          type="color"
          className="absolute inset-0 opacity-0 cursor-pointer"
          value={editor.getAttributes('textStyle').color || '#000000'}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
      </label>
      <ToolBtn onClick={() => editor.chain().focus().unsetColor().run()} title="Clear text color">
        <span className="text-[10px] font-bold">A×</span>
      </ToolBtn>

      {/* Highlight Color */}
      <label
        className="relative h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer"
        title="Highlight color"
      >
        <Highlighter className="h-4 w-4" style={{ color: editor.getAttributes('highlight').color || undefined }} />
        <input
          type="color"
          className="absolute inset-0 opacity-0 cursor-pointer"
          value={editor.getAttributes('highlight').color || '#ffff00'}
          onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
        />
      </label>
      <ToolBtn onClick={() => editor.chain().focus().unsetHighlight().run()} title="Clear highlight">
        <span className="text-[10px] font-bold">H×</span>
      </ToolBtn>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Link */}
      <div className="relative">
        <ToolBtn active={editor.isActive("link")} onClick={() => (showLinkInput ? setShowLinkInput(false) : openLinkInput())} title="Insert / edit link">
          <Link className="h-4 w-4" />
        </ToolBtn>
        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-elevated p-2 flex flex-col gap-2 w-72">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">URL</label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://... or /about or mailto:..."
                className="text-xs px-2 py-1.5 border border-input rounded bg-background"
                onKeyDown={(e) => e.key === "Enter" && setLink()}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground">
                Tip: select text first to hyperlink a word/phrase. Use <code>/path</code> for internal pages.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Open in</label>
              <select
                value={linkTarget}
                onChange={(e) => setLinkTarget(e.target.value as "_self" | "_blank")}
                className="text-xs px-2 py-1.5 border border-input rounded bg-background"
              >
                <option value="_blank">New tab</option>
                <option value="_self">Same tab</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              {editor.isActive("link") && (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={removeLink}>Remove</Button>
              )}
              <Button size="sm" className="h-7 text-xs" onClick={setLink}>Apply</Button>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Dental Blocks */}
      <ToolBtn onClick={() => insertBlock("media")} title="Insert Media Block">
        <ImagePlus className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => insertBlock("cta")} title="Insert CTA Block">
        <MousePointerClick className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => insertBlock("faq")} title="Insert FAQ Block">
        <HelpCircle className="h-4 w-4" />
      </ToolBtn>

      <div className="flex-1" />

      {/* Undo / Redo */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <Undo className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <Redo className="h-4 w-4" />
      </ToolBtn>
    </div>
  );
};

export default EditorToolbar;
