import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X, Sparkles, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { usePlans } from "@/hooks/usePlans";
import { useProfile } from "@/hooks/useProfile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { QuickCategoryDialog } from "@/components/QuickCategoryDialog";

const productSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category_id: z.string().optional(),
  // Novos campos opcionais
  weight: z.string().optional(),
  cost: z.string().optional(),
  discount: z.string().optional(),
  code: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  discount_animation_enabled: z.boolean().optional(),
  discount_animation_color: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ExtendedProduct extends Product {
  category_id?: string;
  weight?: string;
  cost?: number;
  discount?: number;
  code?: string;
  status?: 'active' | 'inactive';
  discount_animation_enabled?: boolean;
  discount_animation_color?: string;
}

interface ProductFormAdvancedProps {
  product?: ExtendedProduct;
  onSubmit: (data: ProductFormData & { images?: string[]; category_id?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductFormAdvanced = ({ product, onSubmit, onCancel, isLoading = false }: ProductFormAdvancedProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || []);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const { toast } = useToast();
  const { categories } = useCategories();
  const { canAccessFeature } = usePlans();
  const { profile } = useProfile();
  
  const { hasUnsavedChanges, markAsChanged, markAsSaved, confirmLeave } = useUnsavedChanges({
    onBeforeUnload: () => {
      return !hasUnsavedChanges || window.confirm(
        'Você tem alterações não salvas. Tem certeza que deseja sair?'
      );
    }
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price?.toString() || "",
      description: product?.description || "",
      category_id: product?.category_id || "none",
      weight: product?.weight || "",
      cost: product?.cost?.toString() || "",
      discount: product?.discount?.toString() || "",
      code: product?.code || "",
      status: product?.status || 'active',
      discount_animation_enabled: product?.discount_animation_enabled || false,
      discount_animation_color: product?.discount_animation_color || '#ff0000',
    },
  });

  const watchedValues = form.watch();
  const hasDiscount = watchedValues.discount && parseFloat(watchedValues.discount) > 0;
  const canUseAnimations = canAccessFeature(profile, 'premium_animations');

  // Marcar como alterado quando qualquer campo mudar
  useState(() => {
    const subscription = form.watch(() => {
      markAsChanged();
    });
    return () => subscription.unsubscribe();
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        continue;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
        continue;
      }

      setSelectedImages(prev => [...prev, file]);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    }
    markAsChanged();
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    markAsChanged();
  };

  const handleSubmit = (data: ProductFormData) => {
    onSubmit({
      ...data,
      images: imagePreviews,
      category_id: data.category_id === "none" ? undefined : data.category_id,
    });
    markAsSaved();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges && !confirmLeave()) {
      return;
    }
    onCancel();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {product ? "Editar Produto" : "Adicionar Produto"}
          {hasUnsavedChanges && (
            <span className="text-orange-500 text-sm">• Não salvo</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagens do Produto</label>
              <div className="flex flex-col items-center gap-4">
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button type="button" variant="outline" asChild>
                      <span className="cursor-pointer">
                        Adicionar Imagens
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tênis Esportivo Premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SKU001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing Information */}
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 299.90"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto % (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="Ex: 10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Discount Animation - Only for Pro+ users with discount */}
            {hasDiscount && canUseAnimations && (
              <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Animação Premium</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="discount_animation_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-y-0 gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">
                            Ativar animação de desconto
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {watchedValues.discount_animation_enabled && (
                    <FormField
                      control={form.control}
                      name="discount_animation_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor da animação</FormLabel>
                          <FormControl>
                            <Input
                              type="color"
                              {...field}
                              className="w-full h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Other Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria (Opcional)</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sem categoria</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowCategoryDialog(true)}
                        title="Adicionar nova categoria"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 500g, 2kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva seu produto..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 btn-hero"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : product ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
            
            {hasUnsavedChanges && (
              <p className="text-sm text-orange-600 text-center">
                Lembre-se de salvar suas alterações!
              </p>
            )}
          </form>
        </Form>
      </CardContent>

      <QuickCategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategoryCreated={(categoryId) => {
          form.setValue('category_id', categoryId);
          toast({
            title: "Categoria criada!",
            description: "A categoria foi adicionada e selecionada automaticamente.",
          });
        }}
      />
    </Card>
  );
};

export default ProductFormAdvanced;
