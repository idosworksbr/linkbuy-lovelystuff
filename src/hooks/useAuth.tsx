
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileUpdateData {
  name?: string;
  store_name?: string;
  store_description?: string;
  profile_photo_url?: string;
  background_color?: string;
  background_type?: string;
  background_image_url?: string;
  custom_background_enabled?: boolean;
  store_url?: string;
  whatsapp_number?: number;
  custom_whatsapp_message?: string;
  instagram_url?: string;
  catalog_theme?: string;
  catalog_layout?: string;
  hide_footer?: boolean;
  product_grid_layout?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
        },
      },
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Conta criada!",
      description: "Verifique seu email para confirmar a conta.",
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Login realizado!",
      description: "Bem-vindo de volta!",
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user) return;

    // Input validation for security
    const sanitizedData = { ...data };
    
    // Validate whatsapp_number if provided
    if (sanitizedData.whatsapp_number && (sanitizedData.whatsapp_number < 1000000000 || sanitizedData.whatsapp_number > 999999999999999)) {
      toast({
        title: "Erro de validação",
        description: "Número do WhatsApp deve ter entre 10 e 15 dígitos.",
        variant: "destructive",
      });
      throw new Error("Invalid WhatsApp number format");
    }

    // Validate store_url if provided
    if (sanitizedData.store_url && !/^[a-z0-9-]+$/.test(sanitizedData.store_url)) {
      toast({
        title: "Erro de validação", 
        description: "URL da loja deve conter apenas letras minúsculas, números e hífens.",
        variant: "destructive",
      });
      throw new Error("Invalid store URL format");
    }

    const { error } = await supabase
      .from('profiles')
      .update(sanitizedData)
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas.",
    });
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
