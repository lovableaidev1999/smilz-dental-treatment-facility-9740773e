import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function inlineBuildCss(): Plugin {
  return {
    name: "inline-build-css",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const cssAssets = Object.values(bundle).filter(
        (file): file is Extract<(typeof bundle)[string], { type: "asset" }> =>
          file.type === "asset" && file.fileName.endsWith(".css"),
      );

      const htmlAssets = Object.values(bundle).filter(
        (file): file is Extract<(typeof bundle)[string], { type: "asset" }> =>
          file.type === "asset" && file.fileName.endsWith(".html"),
      );

      if (!cssAssets.length || !htmlAssets.length) return;

      for (const htmlAsset of htmlAssets) {
        let html = String(htmlAsset.source);

        for (const cssAsset of cssAssets) {
          const safeFileName = cssAsset.fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const inlineStyleTag = `<style data-inlined-from="${cssAsset.fileName}">${String(cssAsset.source).replace(/<\/style>/g, "<\\/style>")}</style>`;

          html = html.replace(
            new RegExp(`<link rel="stylesheet"[^>]*href="/?${safeFileName}"[^>]*>`, "g"),
            inlineStyleTag,
          );

          delete bundle[cssAsset.fileName];
        }

        htmlAsset.source = html;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), inlineBuildCss(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip", "@radix-ui/react-popover"],
          query: ["@tanstack/react-query"],
          motion: ["framer-motion"],
        },
      },
    },
    target: "esnext",
    minify: "esbuild",
  },
}));
