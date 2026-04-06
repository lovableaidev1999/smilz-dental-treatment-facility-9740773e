import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router-dom")) return "vendor";
            if (id.includes("@radix-ui")) return "ui";
            if (id.includes("@tanstack/react-query") || id.includes("@tanstack/query-core")) return "query";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("@tiptap") || id.includes("@dnd-kit") || id.includes("recharts") || id.includes("react-markdown") || id.includes("remark-gfm")) return "admin";
          }
        },
      },
    },
    target: "esnext",
    minify: "esbuild",
  },
}));
