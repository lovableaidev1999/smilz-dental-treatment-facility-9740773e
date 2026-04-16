import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// NOTE: We intentionally DO NOT inline CSS into HTML anymore.
// Inlining CSS bloats every prerendered HTML page (17+ pages × ~50KB),
// inflates HTML payload and prevents the browser from caching CSS across pages.
// External CSS with long-lived cache headers is significantly faster on mobile
// and improves PageSpeed "Use efficient cache lifetimes" score.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
