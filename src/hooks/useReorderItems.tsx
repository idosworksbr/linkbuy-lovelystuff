import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReorderItems = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reorderProducts = async (productIds: string[]) => {
    setLoading(true);
    try {
      // Atualizar a ordem dos produtos
      const updates = productIds.map((id, index) => ({
        id,
        display_order: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('products')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Ordem atualizada!",
        description: "A ordem dos produtos foi salva.",
      });
    } catch (error) {
      console.error('Erro ao reordenar produtos:', error);
      toast({
        title: "Erro ao reordenar",
        description: "Não foi possível salvar a nova ordem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reorderCategories = async (categoryUpdates: Array<{ id: string; display_order: number }>) => {
    setLoading(true);
    try {
      for (const update of categoryUpdates) {
        const { error } = await supabase
          .from('categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Ordem atualizada!",
        description: "A ordem das categorias foi salva.",
      });
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      toast({
        title: "Erro ao reordenar",
        description: "Não foi possível salvar a nova ordem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    reorderProducts,
    reorderCategories,
    loading,
  };
};