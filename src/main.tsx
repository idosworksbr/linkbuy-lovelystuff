import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { MasterAuthProvider } from "@/hooks/useMasterAuth";
import App from './App.tsx'
import './index.css'
import { registerReactInstance } from '@/lib/reactDebug';

// Debug: ensure single React instance at runtime
registerReactInstance('main.tsx');
console.log('[Runtime] React version:', React.version);

if (typeof window !== 'undefined') {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__REACT_SINGLETON__ = true;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MasterAuthProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </MasterAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

