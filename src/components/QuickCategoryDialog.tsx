import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { messages } from '@/lib/messages';
import { validateImage } from '@/lib/validation';

interface QuickCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (categoryId: string) => void;
}

export const QuickCategoryDialog: React.FC<QuickCategoryDialogProps> = ({
  open,
  onOpenChange,
  onCategoryCreated,
}) => {
  const [name, setName] = useState('');
  const [useColor, setUseColor] = useState(true);
  const [color, setColor] = useState('#3b82f6');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createCategory, fetchCategories } = useCategories();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast({
        ...messages.products.imageTooBig,
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const createColorImage = async (color: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Não foi possível criar a imagem'));
        return;
      }

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 400, 400);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Não foi possível criar a imagem'));
          return;
        }
        const file = new File([blob], 'category-color.png', { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('background-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('background-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        ...messages.categories.nameRequired,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';

      if (useColor) {
        const colorImageFile = await createColorImage(color);
        imageUrl = await uploadImage(colorImageFile);
      } else if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Get the highest display_order to add this category at the end
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('display_order')
        .eq('user_id', user?.id)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = existingCategories && existingCategories.length > 0 
        ? (existingCategories[0].display_order || 0) + 1 
        : 0;

      const newCategory = await createCategory({
        name: name.trim(),
        image_url: imageUrl || null,
        display_order: nextOrder,
        is_active: true,
      });

      if (!newCategory) {
        throw new Error('Não foi possível criar a categoria');
      }

      await fetchCategories();

      toast({
        ...messages.categories.created,
        description: `${name} foi adicionada com sucesso.`
      });

      onCategoryCreated(newCategory.id);
      handleClose();
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      
      const errorMessage = error?.message?.includes('mime type') 
        ? 'Formato de imagem não suportado. Use PNG, JPG ou WEBP.'
        : error?.message || 'Não foi possível criar a categoria. Tente novamente';
      
      toast({
        title: messages.categories.createError.title,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setUseColor(true);
    setColor('#3b82f6');
    setImageFile(null);
    setImagePreview('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Categoria Rápida</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome da Categoria *</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Eletrônicos"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="use-color">Usar cor ao invés de imagem</Label>
            <Switch
              id="use-color"
              checked={useColor}
              onCheckedChange={setUseColor}
            />
          </div>

          {useColor ? (
            <div className="space-y-2">
              <Label>Cor da Categoria</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
              <div
                className="w-full h-24 rounded-lg border-2 border-dashed"
                style={{ backgroundColor: color }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Imagem da Categoria</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="category-image"
                  />
                  <label htmlFor="category-image">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">Escolher Imagem</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Máx. 5MB • JPG, PNG ou WEBP
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
