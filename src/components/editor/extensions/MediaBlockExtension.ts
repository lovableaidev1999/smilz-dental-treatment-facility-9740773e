import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import MediaBlockView from "./MediaBlockView";

export const MediaBlock = Node.create({
  name: "mediaBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="media-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "media-block" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaBlockView);
  },
});
