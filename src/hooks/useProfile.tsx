
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
  background_type?: 'color' | 'image';
  background_image_url?: string | null;
  custom_background_enabled?: boolean;
  whatsapp_number: number | null;
  custom_whatsapp_message: string;
  instagram_url: string | null;
  catalog_theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  catalog_layout: 'overlay' | 'bottom';
  product_grid_layout?: 'default' | 'round' | 'instagram';
  hide_footer?: boolean;
  is_verified?: boolean;
  subscription_plan: 'free' | 'pro' | 'pro_plus' | 'verified' | 'pro_plus_verified';
  subscription_expires_at?: string | null;
  
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
      
      // Garantir que os tipos estão corretos
      const profileData: Profile = {
        ...data,
        catalog_theme: (data.catalog_theme as 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset') || 'light',
        catalog_layout: (data.catalog_layout as 'overlay' | 'bottom') || 'bottom',
        product_grid_layout: (data.product_grid_layout as 'default' | 'round' | 'instagram') || 'default',
        background_type: (data.background_type as 'color' | 'image') || 'color',
        custom_background_enabled: data.custom_background_enabled || false,
        custom_whatsapp_message: data.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
        subscription_plan: (data.subscription_plan as 'free' | 'pro' | 'pro_plus' | 'verified' | 'pro_plus_verified') || 'free',
        subscription_expires_at: data.subscription_expires_at || null
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
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Garantir que os tipos estão corretos
      const updatedProfile: Profile = {
        ...data,
        catalog_theme: (data.catalog_theme as 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset') || 'light',
        catalog_layout: (data.catalog_layout as 'overlay' | 'bottom') || 'bottom',
        product_grid_layout: (data.product_grid_layout as 'default' | 'round' | 'instagram') || 'default',
        background_type: (data.background_type as 'color' | 'image') || 'color',
        custom_background_enabled: data.custom_background_enabled || false,
        custom_whatsapp_message: data.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
        subscription_plan: (data.subscription_plan as 'free' | 'pro' | 'pro_plus' | 'verified' | 'pro_plus_verified') || 'free',
        subscription_expires_at: data.subscription_expires_at || null
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
