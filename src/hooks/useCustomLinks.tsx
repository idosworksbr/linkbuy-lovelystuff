import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomLinks = () => {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCustomLinks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('custom-links', {
        method: 'GET',
      });

      if (error) throw error;
      
      setCustomLinks(data.data || []);
    } catch (error) {
      console.error('Error fetching custom links:', error);
      toast({
        title: "Erro ao carregar links",
        description: "Não foi possível carregar os links personalizados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomLink = async (linkData: Omit<CustomLink, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('custom-links', {
        method: 'POST',
        body: linkData,
      });

      if (error) throw error;

      const newLink = data.data;
      setCustomLinks(prev => [...prev, newLink]);
      
      toast({
        title: "Link criado!",
        description: "Seu link personalizado foi criado com sucesso.",
      });

      return newLink;
    } catch (error) {
      console.error('Error creating custom link:', error);
      toast({
        title: "Erro ao criar link",
        description: "Não foi possível criar o link personalizado.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCustomLink = async (id: string, linkData: Partial<CustomLink>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke(`custom-links/${id}`, {
        method: 'PUT',
        body: linkData,
      });

      if (error) throw error;

      const updatedLink = data.data;
      setCustomLinks(prev => 
        prev.map(link => link.id === id ? updatedLink : link)
      );
      
      toast({
        title: "Link atualizado!",
        description: "Seu link personalizado foi atualizado com sucesso.",
      });

      return updatedLink;
    } catch (error) {
      console.error('Error updating custom link:', error);
      toast({
        title: "Erro ao atualizar link",
        description: "Não foi possível atualizar o link personalizado.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCustomLink = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke(`custom-links/${id}`, {
        method: 'DELETE',
      });

      if (error) throw error;

      setCustomLinks(prev => prev.filter(link => link.id !== id));
      
      toast({
        title: "Link removido!",
        description: "O link personalizado foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting custom link:', error);
      toast({
        title: "Erro ao remover link",
        description: "Não foi possível remover o link personalizado.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const reorderCustomLinks = async (reorderedLinks: CustomLink[]) => {
    if (!user) return;

    try {
      // Update display_order for each link
      const updatePromises = reorderedLinks.map((link, index) => 
        updateCustomLink(link.id, { display_order: index })
      );

      await Promise.all(updatePromises);
      setCustomLinks(reorderedLinks);
    } catch (error) {
      console.error('Error reordering custom links:', error);
      toast({
        title: "Erro ao reordenar links",
        description: "Não foi possível reordenar os links.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCustomLinks();
  }, [user]);

  return {
    customLinks,
    loading,
    createCustomLink,
    updateCustomLink,
    deleteCustomLink,
    reorderCustomLinks,
    fetchCustomLinks,
  };
};