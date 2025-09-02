
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category_id?: string | null;
  created_at: string;
  updated_at: string;
  display_order?: number;
  code?: string | null;
  weight?: string | null;
  cost?: number | null;
  discount?: number | null;
  status?: 'active' | 'inactive';
  discount_animation_enabled?: boolean;
  discount_animation_color?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Ensure status field is properly typed
      const typedProducts = (data || []).map(product => ({
        ...product,
        status: (product.status || 'active') as 'active' | 'inactive'
      }));
      setProducts(typedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar seus produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      // Get the next display_order value
      const { data: maxOrderData } = await supabase
        .from('products')
        .select('display_order')
        .eq('user_id', user.id)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1;

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          images: productData.images,
          category_id: productData.category_id || null,
          display_order: nextOrder,
          user_id: user.id,
          code: productData.code || null,
          weight: productData.weight || null,
          cost: productData.cost || null,
          discount: productData.discount || null,
          status: productData.status || 'active',
          discount_animation_enabled: productData.discount_animation_enabled || false,
          discount_animation_color: productData.discount_animation_color || '#ff0000',
        })
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [{
        ...data,
        status: (data.status || 'active') as 'active' | 'inactive'
      }, ...prev]);
      toast({
        title: "Produto criado!",
        description: "Seu produto foi adicionado ao catálogo.",
      });

      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erro ao criar produto",
        description: "Não foi possível adicionar o produto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? {
        ...data,
        status: (data.status || 'active') as 'active' | 'inactive'
      } : p));
      toast({
        title: "Produto atualizado!",
        description: "As alterações foram salvas.",
      });

      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Produto removido",
        description: "O produto foi removido do catálogo.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o produto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
  };
};
