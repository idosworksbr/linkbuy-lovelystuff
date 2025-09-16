
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount?: number | null;
  discount_animation_enabled?: boolean;
  discount_animation_color?: string | null;
  images: string[];
  created_at: string;
  store: {
    id: string;
    store_name: string;
    store_description: string | null;
    profile_photo_url: string | null;
    background_color: string;
    store_url: string;
    whatsapp_number: number | null;
    custom_whatsapp_message: string;
    instagram_url: string | null;
    catalog_theme: 'light' | 'dark' | 'beige';
    catalog_layout: 'overlay' | 'bottom';
    hide_footer?: boolean;
  };
}

export const useProductDetail = (storeUrl: string, productId: string) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!storeUrl || !productId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Buscando detalhes do produto:', { storeUrl, productId });
        
        const { data, error } = await supabase.functions.invoke('product-detail', {
          body: { 
            store_url: storeUrl, 
            product_id: productId 
          }
        });

        if (error) {
          console.error('Erro ao buscar produto:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Produto não encontrado');
        }

        console.log('Produto carregado:', data);
        setProduct(data);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [storeUrl, productId]);

  return {
    product,
    loading,
    error,
  };
};
