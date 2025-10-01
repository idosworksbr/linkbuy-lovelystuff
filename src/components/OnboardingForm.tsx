import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ImageUploadField } from '@/components/ImageUploadField';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';

const onboardingSchema = z.object({
  // Informações da loja
  store_name: z.string().min(1, "Nome da loja é obrigatório"),
  niche: z.string().min(1, "Nicho é obrigatório"),
  
  // Contatos
  whatsapp_number: z.string().optional(),
  instagram_url: z.string().optional(),
  
  // Primeira categoria
  category_name: z.string().min(1, "Nome da categoria é obrigatório"),
  
  // Primeiro produto
  product_name: z.string().min(1, "Nome do produto é obrigatório"),
  product_price: z.string().min(1, "Preço é obrigatório"),
  product_description: z.string().min(1, "Descrição é obrigatória"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const niches = [
  "Moda e Acessórios",
  "Casa e Decoração",
  "Eletrônicos",
  "Beleza e Cosméticos",
  "Esportes e Fitness",
  "Alimentação",
  "Arte e Artesanato",
  "Livros e Educação",
  "Saúde e Bem-estar",
  "Tecnologia",
  "Automóveis",
  "Pets",
  "Outro"
];

interface OnboardingFormProps {
  onComplete: (data: OnboardingFormData & { 
    profile_photo?: File | undefined;
    category_image?: File | undefined;
    product_images?: File[];
  }) => void;
  isLoading?: boolean;
}

export const OnboardingForm = ({ onComplete, isLoading = false }: OnboardingFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>("");
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const { completeOnboarding, loading } = useOnboarding();
  const { toast } = useToast();
  const totalSteps = 5; // Aumentado para incluir step de planos
  const [canSkipProduct, setCanSkipProduct] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      store_name: "",
      niche: "",
      whatsapp_number: "",
      instagram_url: "",
      category_name: "",
      product_name: "",
      product_price: "",
      product_description: "",
    },
  });

  const handleImageUpload = (
    file: File,
    type: 'profile' | 'category' | 'product'
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return false;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (type === 'profile') {
        setProfilePhoto(file);
        setProfilePhotoPreview(result);
      } else if (type === 'category') {
        setCategoryImageFile(file);
        setCategoryImagePreview(result);
      } else if (type === 'product') {
        setProductImages(prev => [...prev, file]);
        setProductImagePreviews(prev => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
    return true;
  };

  const removeProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setProductImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep === 2) {
      // After step 2 (contacts), enable skipping
      setCanSkipProduct(true);
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const skipToFinish = async () => {
    // Complete onboarding without product
    const data = form.getValues();
    const onboardingData = {
      storeName: data.store_name,
      storeDescription: '', // Premium feature
      niche: data.niche,
      whatsappNumber: data.whatsapp_number || '',
      instagramUrl: data.instagram_url || '',
      categoryName: 'Geral',
      categoryDescription: '',
      productName: '',
      productDescription: '',
      productPrice: 0,
    };
    
    const files = {
      profileImage: profilePhoto || undefined,
      categoryImage: categoryImageFile || undefined,
      productImages: undefined,
    };
    
    const success = await completeOnboarding(onboardingData, files);
    if (success) {
      onComplete({
        ...data,
        profile_photo: profilePhoto || undefined,
        category_image: categoryImageFile || undefined,
        product_images: undefined,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: OnboardingFormData) => {
    const onboardingData = {
      storeName: data.store_name,
      storeDescription: '', // Premium feature
      niche: data.niche,
      whatsappNumber: data.whatsapp_number || '',
      instagramUrl: data.instagram_url || '',
      categoryName: data.category_name,
      categoryDescription: '',
      productName: data.product_name,
      productDescription: data.product_description,
      productPrice: parseFloat(data.product_price),
    };
    
    const files = {
      profileImage: profilePhoto || undefined,
      categoryImage: categoryImageFile || undefined,
      productImages: productImages.length > 0 ? productImages : undefined,
    };
    
    const success = await completeOnboarding(onboardingData, files);
    if (success) {
      onComplete({
        ...data,
        profile_photo: profilePhoto || undefined,
        category_image: categoryImageFile || undefined,
        product_images: productImages.length > 0 ? productImages : undefined,
      });
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-center">Configure sua Loja</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Etapa {currentStep} de {totalSteps}
          </p>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Etapa 1: Informações Básicas */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium">Informações da Loja</h3>
                  <p className="text-sm text-muted-foreground">
                    Vamos começar com as informações básicas da sua loja
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="store_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Loja</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Loja da Maria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nicho do seu Negócio</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu nicho" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {niches.map((niche) => (
                            <SelectItem key={niche} value={niche.toLowerCase()}>
                              {niche}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> A descrição da loja é uma funcionalidade premium. Você poderá adicioná-la após fazer upgrade para um plano pago.
                  </p>
                </div>

                {/* Foto de Perfil */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Foto de Perfil (Opcional)</label>
                  <div className="flex flex-col items-center gap-4">
                    {profilePhotoPreview && (
                      <div className="relative">
                        <img
                          src={profilePhotoPreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => {
                            setProfilePhoto(null);
                            setProfilePhotoPreview("");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'profile');
                      }}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload">
                      <Button type="button" variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Adicionar Foto
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Contatos */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium">Informações de Contato</h3>
                  <p className="text-sm text-muted-foreground">
                    Como seus clientes vão entrar em contato com você?
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="whatsapp_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do WhatsApp (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 5511999999999"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Inclua o código do país e área (apenas números)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do Instagram (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/seuperfil"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Link completo do seu perfil no Instagram
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Pelo menos um método de contato é recomendado para que seus clientes possam entrar em contato com você.
                  </p>
                </div>
              </div>
            )}

            {/* Etapa 3: Primeira Categoria */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium">Primeira Categoria</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize seus produtos criando sua primeira categoria
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="category_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Camisetas, Calçados, Acessórios" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Imagem da Categoria */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagem da Categoria (Opcional)</label>
                  <div className="flex flex-col items-center gap-4">
                    {categoryImagePreview && (
                      <div className="relative">
                        <img
                          src={categoryImagePreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-lg object-cover border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => {
                            setCategoryImageFile(null);
                            setCategoryImagePreview("");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'category');
                      }}
                      className="hidden"
                      id="category-upload"
                    />
                    <label htmlFor="category-upload">
                      <Button type="button" variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Adicionar Imagem
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 4: Primeiro Produto */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium">Primeiro Produto</h3>
                  <p className="text-sm text-muted-foreground">
                    Vamos adicionar seu primeiro produto ao catálogo
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="product_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Camiseta Básica Branca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="29.90"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva seu produto..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Imagens do Produto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagens do Produto (Opcional)</label>
                  <div className="flex flex-col items-center gap-4">
                    {productImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {productImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => removeProductImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleImageUpload(file, 'product'));
                      }}
                      className="hidden"
                      id="product-upload"
                    />
                    <label htmlFor="product-upload">
                      <Button type="button" variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Adicionar Imagens
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Quase pronto!</p>
                      <p className="text-sm text-green-700">
                        Após finalizar, você terá sua loja online completa com categoria e produto configurados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 5: Opções de Planos */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium">Escolha seu Plano</h3>
                  <p className="text-sm text-muted-foreground">
                    Desbloqueie recursos premium para impulsionar suas vendas
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">Plano Free</h4>
                        <p className="text-2xl font-bold">R$ 0<span className="text-sm font-normal">/mês</span></p>
                      </div>
                      <Badge>Atual</Badge>
                    </div>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>✓ Catálogo básico</li>
                      <li>✓ Até 50 produtos</li>
                      <li>✓ WhatsApp e Instagram</li>
                      <li>✓ Analytics básico</li>
                    </ul>
                  </div>

                  <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">Plano Pro</h4>
                        <p className="text-2xl font-bold text-primary">R$ 29,90<span className="text-sm font-normal">/mês</span></p>
                      </div>
                      <Badge className="bg-primary">Recomendado</Badge>
                    </div>
                    <ul className="text-sm space-y-2">
                      <li>✓ Produtos ilimitados</li>
                      <li>✓ Descrição da loja</li>
                      <li>✓ Background personalizado</li>
                      <li>✓ Analytics avançado</li>
                      <li>✓ Links personalizados</li>
                      <li>✓ Captura de leads</li>
                    </ul>
                    <Button className="w-full mt-4" onClick={() => window.location.href = '/plans'}>
                      Começar Trial Gratuito
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">Plano Pro+</h4>
                        <p className="text-2xl font-bold">R$ 49,90<span className="text-sm font-normal">/mês</span></p>
                      </div>
                      <Badge variant="outline">Premium</Badge>
                    </div>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>✓ Tudo do Pro</li>
                      <li>✓ Selo de verificado</li>
                      <li>✓ Suporte prioritário</li>
                      <li>✓ Recursos exclusivos</li>
                    </ul>
                    <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = '/plans'}>
                      Ver Detalhes
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground mt-6">
                  Você pode atualizar ou cancelar seu plano a qualquer momento
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                  disabled={isLoading || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
              
              {/* Skip button - show after step 2 for product step */}
              {canSkipProduct && currentStep > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={skipToFinish}
                  disabled={isLoading || loading}
                  className="text-muted-foreground"
                >
                  Pular por agora
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={isLoading || loading}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 btn-hero"
                  disabled={isLoading || loading}
                >
                  {(isLoading || loading) ? "Criando loja..." : "Finalizar Configuração"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};