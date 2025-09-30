import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Strongly enforce a single React/ReactDOM instance to avoid null dispatcher errors
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force React to resolve from the app's node_modules
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    // Dedupe to ensure a single copy across the app and deps
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Prevent Vite from pre-bundling its own copy of React
    exclude: ["react", "react-dom"],
    force: true,
  },
}));
