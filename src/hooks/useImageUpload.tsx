import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export interface ImageUploadOptions {
  bucket: 'profile-photos' | 'background-images';
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadImage = async (
    file: File,
    options: ImageUploadOptions
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer upload de imagens.",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: `Apenas imagens ${allowedTypes.map(t => t.split('/')[1]).join(', ')} são permitidas.`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file size (default 5MB for profile photos, 10MB for background images)
    const maxSize = options.maxSize || (options.bucket === 'profile-photos' ? 5 * 1024 * 1024 : 10 * 1024 * 1024);
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxMB}MB.`,
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      toast({
        title: "Upload realizado com sucesso",
        description: "Sua imagem foi enviada com sucesso.",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (
    bucket: string,
    filePath: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading
  };
};