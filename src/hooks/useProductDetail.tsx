
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  created_at: string;
  store: {
    store_name: string;
    whatsapp_number: string | null;
  };
}

export const useProductDetail = (storeUrl: string, productId: string) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!storeUrl || !productId) {
        setError('Parâmetros inválidos');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Buscando produto:', { storeUrl, productId });
        
        const response = await fetch(
          `https://rpkawimruhfqhxbpavce.supabase.co/functions/v1/product-detail/${storeUrl}/${productId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            error: 'Erro na resposta do servidor'
          }));
          throw new Error(errorData.message || errorData.error || 'Produto não encontrado');
        }

        const data: ProductDetail = await response.json();
        console.log('✅ Produto carregado:', data);
        
        setProduct(data);
        
      } catch (error) {
        console.error('💥 Error fetching product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Não foi possível carregar o produto';
        setError(errorMessage);
        
        toast({
          title: "Erro ao carregar produto",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [storeUrl, productId, toast]);

  return {
    product,
    loading,
    error,
  };
};
