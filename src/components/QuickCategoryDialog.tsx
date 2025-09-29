import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';

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
  const { createCategory, fetchCategories } = useCategories();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
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
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';

      if (useColor) {
        // Criar uma imagem SVG com a cor sólida
        const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="${color}"/></svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const file = new File([blob], 'color.svg', { type: 'image/svg+xml' });
        imageUrl = await uploadImage(file);
      } else if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const newCategory = await createCategory({
        name: name.trim(),
        image_url: imageUrl || null,
        display_order: 0,
        is_active: true,
      });

      await fetchCategories();

      toast({
        title: "Categoria criada!",
        description: `${name} foi adicionada com sucesso.`,
      });

      onCategoryCreated(newCategory.id);
      handleClose();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível criar a categoria. Tente novamente.",
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
