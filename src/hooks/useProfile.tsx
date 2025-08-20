
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  name: string;
  store_url: string;
  store_name: string;
  store_description: string | null;
  profile_photo_url: string | null;
  background_color: string;
  whatsapp_number: string | null; // Mantendo como string para facilitar a manipulação no frontend
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Converter whatsapp_number de number para string
      const profileData = {
        ...data,
        whatsapp_number: data.whatsapp_number ? data.whatsapp_number.toString() : null
      };
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return;

    try {
      // Converter whatsapp_number de string para number para o banco
      const updateData = {
        ...profileData,
        whatsapp_number: profileData.whatsapp_number ? parseFloat(profileData.whatsapp_number) : null
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Converter de volta para string para o estado
      const updatedProfile = {
        ...data,
        whatsapp_number: data.whatsapp_number ? data.whatsapp_number.toString() : null
      };

      setProfile(updatedProfile);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas.",
      });

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    fetchProfile,
  };
};
