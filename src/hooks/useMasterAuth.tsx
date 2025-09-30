import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Master {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface MasterAuthContextType {
  master: Master | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const MasterAuthContext = createContext<MasterAuthContextType | undefined>(undefined);

export const MasterAuthProvider = ({ children }: { children: ReactNode }) => {
  const [master, setMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const token = localStorage.getItem('master_token');
    if (token) {
      // Verify token and get master data
      verifyMasterToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyMasterToken = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-master-token', {
        body: { token }
      });
      
      if (error) throw error;
      
      if (data?.master) {
        setMaster(data.master);
      } else {
        localStorage.removeItem('master_token');
      }
    } catch (error) {
      console.error('Error verifying master token:', error);
      localStorage.removeItem('master_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.functions.invoke('master-login', {
      body: { email, password }
    });

    if (error) throw error;

    if (data?.token && data?.master) {
      localStorage.setItem('master_token', data.token);
      setMaster(data.master);
    } else {
      throw new Error('Credenciais inválidas');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('master_token');
    setMaster(null);
  };

  return (
    <MasterAuthContext.Provider value={{
      master,
      loading,
      signIn,
      signOut
    }}>
      {children}
    </MasterAuthContext.Provider>
  );
};

export const useMasterAuth = () => {
  const context = useContext(MasterAuthContext);
  if (context === undefined) {
    throw new Error('useMasterAuth must be used within a MasterAuthProvider');
  }
  return context;
};