import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { MediaBlock } from "./extensions/MediaBlockExtension";
import { CTABlock } from "./extensions/CTABlockExtension";
import { FAQBlock } from "./extensions/FAQBlockExtension";
import EditorToolbar from "./EditorToolbar";
import type { JSONContent } from "@tiptap/core";
import { useEffect } from "react";

interface Props {
  content?: JSONContent | null;
  onChange?: (json: JSONContent) => void;
  placeholder?: string;
}

const TipTapEditor = ({ content, onChange, placeholder = "Start writing your content…" }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({ placeholder }),
      MediaBlock,
      CTABlock,
      FAQBlock,
    ],
    content: content || undefined,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none dark:prose-invert prose-headings:font-heading prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary focus:outline-none min-h-[400px] px-4 py-3",
      },
      transformPastedHTML(html) {
        // Create a temporary DOM to clean and preserve structure
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Remove all inline styles and classes that break formatting
        doc.querySelectorAll('*').forEach((el) => {
          el.removeAttribute('style');
          el.removeAttribute('class');
          el.removeAttribute('id');
        });

        // Convert <div> wrappers (common from ChatGPT/Google Docs) to <p>
        doc.querySelectorAll('div').forEach((div) => {
          // Only convert leaf divs (no block children) to paragraphs
          const hasBlockChild = div.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, table, div');
          if (!hasBlockChild) {
            const p = doc.createElement('p');
            p.innerHTML = div.innerHTML;
            div.replaceWith(p);
          }
        });

        // Convert <b> to <strong> and <i> to <em> for consistency
        doc.querySelectorAll('b').forEach((b) => {
          const strong = doc.createElement('strong');
          strong.innerHTML = b.innerHTML;
          b.replaceWith(strong);
        });
        doc.querySelectorAll('i').forEach((i) => {
          const em = doc.createElement('em');
          em.innerHTML = i.innerHTML;
          i.replaceWith(em);
        });

        return doc.body.innerHTML;
      },
    },
  });

  // Sync external content changes (e.g. loading from DB)
  useEffect(() => {
    if (editor && content && !editor.isFocused) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(content);
      if (currentJSON !== newJSON) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
