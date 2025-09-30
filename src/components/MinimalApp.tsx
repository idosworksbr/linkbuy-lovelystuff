import { useEffect } from 'react';
import { registerReactInstance } from '@/lib/reactDebug';

// Componente mínimo para testar se os hooks do React funcionam
export const MinimalApp = () => {
  useEffect(() => {
    registerReactInstance('MinimalApp');
    console.log('[MinimalApp] Mounted successfully - hooks working!');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">✅ React Hooks Working</h1>
        <p className="text-muted-foreground">MinimalApp loaded successfully</p>
        <p className="text-sm text-muted-foreground">Check console for React instance debug info</p>
      </div>
    </div>
  );
};
