
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { messages, getErrorMessage } from '@/lib/messages';
import { storeUrlSchema, whatsappSchema } from '@/lib/validation';

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
    try {
      // Define redirect URL ensuring production points to the correct domain
      const redirectUrl =
        typeof window !== 'undefined' && window.location.origin.includes('mylinkbuy.com.br')
          ? 'https://www.mylinkbuy.com.br/login'
          : `${window.location.origin}/login`;
      
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
        throw error;
      }

      toast(messages.auth.signupSuccess);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      toast({
        ...errorMsg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast(messages.auth.loginSuccess);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      toast({
        ...errorMsg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear session regardless of API response
      setSession(null);
      setUser(null);
      
      await supabase.auth.signOut({ scope: 'local' });
      
      // Force redirect to landing page
      window.location.href = '/';
    } catch (error: any) {
      // Even if there's an error, clear local state and redirect
      setSession(null);
      setUser(null);
      window.location.href = '/';
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user) return;

    try {
      // Input validation for security
      const sanitizedData = { ...data };
      
      // Validate whatsapp_number if provided
      if (sanitizedData.whatsapp_number) {
        const whatsappStr = sanitizedData.whatsapp_number.toString();
        const result = whatsappSchema.safeParse(whatsappStr);
        if (!result.success) {
          toast({
            ...messages.profile.whatsappInvalid,
            variant: "destructive",
          });
          throw new Error("Invalid WhatsApp number format");
        }
      }

      // Validate store_url if provided
      if (sanitizedData.store_url) {
        const result = storeUrlSchema.safeParse(sanitizedData.store_url);
        if (!result.success) {
          toast({
            ...messages.profile.invalidStoreUrl,
            variant: "destructive",
          });
          throw new Error("Invalid store URL format");
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast(messages.profile.updated);
    } catch (error: any) {
      if (error.message.includes('Invalid')) {
        // Validação já exibiu o toast
        return;
      }
      const errorMsg = getErrorMessage(error);
      toast({
        ...errorMsg,
        variant: "destructive",
      });
      throw error;
    }
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
