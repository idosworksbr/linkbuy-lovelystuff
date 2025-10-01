import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Temporarily disabled to diagnose React duplication issue
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Goal: guarantee a single React instance across all dependencies
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Temporarily disabled to diagnose React duplication issue
    // mode === 'development' && componentTagger(),
  ].filter(Boolean),
  define: {
    // Force cache bust on dev server
    __BUILD_ID__: JSON.stringify(Date.now()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force all React imports to use the same instance
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "scheduler",
    ],
  },
  optimizeDeps: {
    // Let Vite prebundle React to ensure a single optimized copy
    include: [
      "react",
      "react-dom",
    ],
    force: true,
  },
}));
