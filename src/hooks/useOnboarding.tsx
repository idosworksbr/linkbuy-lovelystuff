import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface OnboardingData {
  storeName: string;
  storeDescription: string;
  niche: string;
  whatsappNumber: string;
  instagramUrl: string;
  categoryName: string;
  categoryDescription: string;
  productName: string;
  productDescription: string;
  productPrice: number;
  productCost?: number;
  productWeight?: string;
  productCode?: string;
  productDiscount?: number;
}

interface OnboardingFiles {
  profileImage?: File;
  categoryImage?: File;
  productImages?: File[];
}

export const useOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { uploadImage } = useImageUpload();
  const { toast } = useToast();
  const navigate = useNavigate();

  const completeOnboarding = async (data: OnboardingData, files: OnboardingFiles) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // 1. Upload images
      let profilePhotoUrl = '';
      let categoryImageUrl = '';
      let productImageUrls: string[] = [];

      if (files.profileImage) {
        const url = await uploadImage(files.profileImage, {
          bucket: 'profile-photos',
          folder: user.id,
        });
        if (url) profilePhotoUrl = url;
      }

      if (files.categoryImage) {
        const url = await uploadImage(files.categoryImage, {
          bucket: 'profile-photos',
          folder: `${user.id}/categories`,
        });
        if (url) categoryImageUrl = url;
      }

      if (files.productImages && files.productImages.length > 0) {
        for (const file of files.productImages) {
          const url = await uploadImage(file, {
            bucket: 'profile-photos',
            folder: `${user.id}/products`,
          });
          if (url) productImageUrls.push(url);
        }
      }

      // 2. Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          store_name: data.storeName,
          store_description: data.storeDescription,
          niche: data.niche,
          whatsapp_number: data.whatsappNumber ? parseFloat(data.whatsappNumber) : null,
          instagram_url: data.instagramUrl || null,
          profile_photo_url: profilePhotoUrl || null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. Create category (idempotent: reuse if exists)
      let categoryData = null;
      if (data.categoryName && data.categoryName !== 'Geral') {
        const { data: existingCategory, error: findCatError } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', data.categoryName)
          .maybeSingle();

        if (findCatError) {
          console.warn('Aviso ao buscar categoria existente:', findCatError);
        }

        if (existingCategory) {
          categoryData = existingCategory;
        } else {
          const { data: catData, error: categoryError } = await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              name: data.categoryName,
              image_url: categoryImageUrl || null,
              display_order: 1,
              is_active: true,
            })
            .select()
            .single();

          if (categoryError) throw categoryError;
          categoryData = catData;
        }
      }

      // 4. Create product (idempotent: update if exists)
      if (data.productName && categoryData) {
        const { data: existingProduct, error: findProdError } = await supabase
          .from('products')
          .select('id')
          .eq('user_id', user.id)
          .eq('category_id', categoryData.id)
          .eq('name', data.productName)
          .maybeSingle();

        if (findProdError) {
          console.warn('Aviso ao buscar produto existente:', findProdError);
        }

        if (existingProduct) {
          const { error: updateProductError } = await supabase
            .from('products')
            .update({
              description: data.productDescription,
              price: data.productPrice,
              cost: data.productCost || null,
              weight: data.productWeight || null,
              code: data.productCode || null,
              discount: data.productDiscount || null,
              images: productImageUrls,
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProduct.id);
          if (updateProductError) throw updateProductError;
        } else {
          const { error: productError } = await supabase
            .from('products')
            .insert({
              user_id: user.id,
              category_id: categoryData.id,
              name: data.productName,
              description: data.productDescription,
              price: data.productPrice,
              cost: data.productCost || null,
              weight: data.productWeight || null,
              code: data.productCode || null,
              discount: data.productDiscount || null,
              images: productImageUrls,
              display_order: 1,
              status: 'active',
            });
          if (productError) throw productError;
        }
      }

      toast({
        title: "Configuração concluída!",
        description: "Sua loja foi configurada com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Erro no onboarding:', error);
      toast({
        title: "Erro na configuração",
        description: error.message || "Não foi possível concluir a configuração da loja",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    completeOnboarding,
    loading,
  };
};