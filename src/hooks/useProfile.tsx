
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
  whatsapp_number: string | null;
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
        .select('id, name, store_url, store_name, store_description, profile_photo_url, background_color, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Adiciona whatsapp_number como null temporariamente até a coluna ser criada
      const profileWithWhatsApp = {
        ...data,
        whatsapp_number: null
      };
      
      setProfile(profileWithWhatsApp);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return;

    try {
      // Remove whatsapp_number dos dados se estiver presente, até a coluna ser criada
      const { whatsapp_number, ...dataWithoutWhatsApp } = profileData;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(dataWithoutWhatsApp)
        .eq('id', user.id)
        .select('id, name, store_url, store_name, store_description, profile_photo_url, background_color, created_at, updated_at')
        .single();

      if (error) throw error;

      // Adiciona whatsapp_number como null temporariamente
      const profileWithWhatsApp = {
        ...data,
        whatsapp_number: null
      };

      setProfile(profileWithWhatsApp);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas.",
      });

      return profileWithWhatsApp;
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
