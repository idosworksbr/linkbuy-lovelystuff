import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para gerar store_url no primeiro login do usuário
 * Só executa se store_url for NULL
 */
export const useStoreUrlGeneration = (userId?: string, currentStoreUrl?: string | null) => {
  const { toast } = useToast();

  useEffect(() => {
    const generateStoreUrl = async () => {
      // Só gerar se tiver userId e store_url for NULL
      if (!userId || currentStoreUrl !== null) {
        return;
      }

      try {
        console.log('[STORE-URL] Gerando store_url para usuário:', userId);

        // Buscar informações do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, store_name')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('[STORE-URL] Erro ao buscar perfil:', profileError);
          return;
        }

        // Gerar base do store_url a partir do nome ou store_name
        const baseName = profile?.name || profile?.store_name || 'loja';
        let baseStoreUrl = baseName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
          .replace(/\s+/g, '-') // Substitui espaços por hífens
          .replace(/-+/g, '-') // Remove hífens múltiplos
          .replace(/^-|-$/g, ''); // Remove hífens no início e fim

        // Garantir que não está vazio
        if (!baseStoreUrl) {
          baseStoreUrl = 'loja-' + userId.substring(0, 8);
        }

        let finalStoreUrl = baseStoreUrl;
        let counter = 0;
        const maxAttempts = 10;

        // Tentar encontrar um store_url único
        while (counter < maxAttempts) {
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('store_url', finalStoreUrl)
            .single();

          if (!existing) {
            break; // URL está disponível
          }

          counter++;
          finalStoreUrl = `${baseStoreUrl}-${counter}`;
        }

        // Se ainda não achou, adicionar parte do ID
        if (counter >= maxAttempts) {
          finalStoreUrl = `${baseStoreUrl}-${userId.substring(0, 6)}`;
        }

        // Atualizar o perfil com o store_url
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ store_url: finalStoreUrl })
          .eq('id', userId);

        if (updateError) {
          console.error('[STORE-URL] Erro ao atualizar store_url:', updateError);
          toast({
            title: 'Erro',
            description: 'Erro ao gerar URL da loja',
            variant: 'destructive',
          });
          return;
        }

        console.log('[STORE-URL] store_url gerado com sucesso:', finalStoreUrl);
        
        // Recarregar a página para atualizar o perfil
        window.location.reload();
      } catch (error) {
        console.error('[STORE-URL] Erro inesperado:', error);
      }
    };

    generateStoreUrl();
  }, [userId, currentStoreUrl, toast]);
};
