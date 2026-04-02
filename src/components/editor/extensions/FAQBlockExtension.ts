import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FAQBlockView from "./FAQBlockView";

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQBlock = Node.create({
  name: "faqBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      items: {
        default: [{ question: "", answer: "" }],
        parseHTML: (el: HTMLElement) => {
          try { return JSON.parse(el.getAttribute("data-items") || "[]"); } catch { return []; }
        },
        renderHTML: (attrs: Record<string, any>) => ({ "data-items": JSON.stringify(attrs.items) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="faq-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "faq-block" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FAQBlockView);
  },
});
