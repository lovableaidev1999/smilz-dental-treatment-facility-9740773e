import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CTABlockView from "./CTABlockView";

export const CTABlock = Node.create({
  name: "ctaBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      text: { default: "Book Appointment" },
      url: { default: "/contact" },
      style: { default: "navy" }, // navy | gold
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="cta-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "cta-block" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CTABlockView);
  },
});
