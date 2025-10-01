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
      // Ensure single React instance
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    force: true,
  },
}));
