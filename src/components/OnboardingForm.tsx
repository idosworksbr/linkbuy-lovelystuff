import React, { useState, useEffect } from 'react';
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
import { useSubscription } from '@/hooks/useSubscription';
import { usePlans } from '@/hooks/usePlans';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, Upload, X, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { getPriceIdByPlan } from '@/lib/stripe';
import { useProfile } from '@/hooks/useProfile';

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
  const { createCheckout } = useSubscription();
  const { plans } = usePlans();
  const navigate = useNavigate();
  const totalSteps = 5;
  const [canSkipProduct, setCanSkipProduct] = useState(false);
const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);
const { profile } = useProfile();

useEffect(() => {
  if (profile?.onboarding_completed) {
    navigate('/dashboard', { replace: true });
  }
}, [profile, navigate]);

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
    if (isCompletingOnboarding) return;
    
    console.log('[OnboardingForm] Skip pressionado - finalizando sem plano...');
    await handleFinishWithoutPlan();
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: OnboardingFormData) => {
    if (isCompletingOnboarding) return;
    
    setIsCompletingOnboarding(true);
    const onboardingData = {
      storeName: data.store_name,
      storeDescription: '',
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
    
    try {
      const success = await completeOnboarding(onboardingData, files);
      if (success) {
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setIsCompletingOnboarding(false);
    }
  };

  const handleFinishWithoutPlan = async () => {
    if (isCompletingOnboarding) return;
    
    console.log('[OnboardingForm] Iniciando finalização sem plano...');
    setIsCompletingOnboarding(true);
    const data = form.getValues();
    
    console.log('[OnboardingForm] Dados do formulário:', {
      storeName: data.store_name,
      niche: data.niche,
      whatsapp: data.whatsapp_number,
      category: data.category_name,
      product: data.product_name
    });
    
    const onboardingData = {
      storeName: data.store_name,
      storeDescription: '',
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
    
    try {
      console.log('[OnboardingForm] Chamando completeOnboarding...');
      const success = await completeOnboarding(onboardingData, files);
      console.log('[OnboardingForm] Resultado do completeOnboarding:', success);
      
      if (success) {
        console.log('[OnboardingForm] Sucesso! Disparando onComplete para encerrar onboarding...');
        onComplete({
          ...form.getValues(),
          profile_photo: profilePhoto || undefined,
          category_image: categoryImageFile || undefined,
          product_images: productImages,
        });
      } else {
        console.error('[OnboardingForm] completeOnboarding retornou false');
        toast({
          title: "Erro",
          description: "Não foi possível salvar os dados. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[OnboardingForm] Erro ao finalizar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive"
      });
    } finally {
      setIsCompletingOnboarding(false);
    }
  };

  const handleSelectPlan = async (planName: string) => {
    if (isCompletingOnboarding) return;
    
    if (planName === "Free") {
      await handleFinishWithoutPlan();
      return;
    }

    // Save data first
    setIsCompletingOnboarding(true);
    const data = form.getValues();
    const onboardingData = {
      storeName: data.store_name,
      storeDescription: '',
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
    
    try {
      const success = await completeOnboarding(onboardingData, files);
      if (success) {
        // After saving, redirect to checkout using centralized helper
        const priceId = getPriceIdByPlan(planName);
        if (priceId) {
          console.log(`[OnboardingForm] Iniciando checkout para ${planName} com priceId: ${priceId}`);
          createCheckout(priceId);
          toast({
            title: 'Checkout aberto',
            description: 'Abrimos o pagamento em uma nova aba. Finalizando seu onboarding...',
          });
          onComplete({
            ...form.getValues(),
            profile_photo: profilePhoto || undefined,
            category_image: categoryImageFile || undefined,
            product_images: productImages,
          });
        } else {
          toast({
            title: 'Erro na configuração',
            description: `Plano ${planName} não encontrado. Redirecionando para o dashboard...`,
            variant: 'destructive'
          });
          navigate('/dashboard', { replace: true });
        }
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar os dados. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in handleSelectPlan:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive"
      });
    } finally {
      setIsCompletingOnboarding(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <div className="space-y-2">
          <CardTitle className="text-center text-lg sm:text-xl">Configure sua Loja</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Etapa {currentStep} de {totalSteps}
          </p>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            
            {/* Etapa 1: Informações Básicas */}
            {currentStep === 1 && (
              <div className="space-y-3 sm:space-y-4 animate-fade-in">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium">Informações da Loja</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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

                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    💡 <strong>Dica:</strong> A descrição da loja é uma funcionalidade premium. Você poderá adicioná-la após fazer upgrade para um plano pago.
                  </p>
                </div>

                {/* Foto de Perfil */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Foto de Perfil (Opcional)</label>
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    {profilePhotoPreview && (
                      <div className="relative">
                        <img
                          src={profilePhotoPreview}
                          alt="Preview"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full"
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
                    <label htmlFor="profile-upload" className="w-full sm:w-auto">
                      <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                        <span className="cursor-pointer text-xs sm:text-sm">
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
              <div className="space-y-3 sm:space-y-4 animate-fade-in">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium">Informações de Contato</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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

                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Pelo menos um método de contato é recomendado para que seus clientes possam entrar em contato com você.
                  </p>
                </div>
              </div>
            )}

            {/* Etapa 3: Primeira Categoria */}
            {currentStep === 3 && (
              <div className="space-y-3 sm:space-y-4 animate-fade-in">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium">Primeira Categoria</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
                  <label className="text-xs sm:text-sm font-medium">Imagem da Categoria (Opcional)</label>
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    {categoryImagePreview && (
                      <div className="relative">
                        <img
                          src={categoryImagePreview}
                          alt="Preview"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6"
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
                    <label htmlFor="category-upload" className="w-full sm:w-auto">
                      <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                        <span className="cursor-pointer text-xs sm:text-sm">
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
              <div className="space-y-3 sm:space-y-4 animate-fade-in">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium">Primeiro Produto</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
                  <label className="text-xs sm:text-sm font-medium">Imagens do Produto (Opcional)</label>
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    {productImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                        {productImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6"
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
                    <label htmlFor="product-upload" className="w-full sm:w-auto">
                      <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                        <span className="cursor-pointer text-xs sm:text-sm">
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Adicionar Imagens
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-green-800">Quase pronto!</p>
                      <p className="text-xs sm:text-sm text-green-700">
                        Após finalizar, você terá sua loja online completa com categoria e produto configurados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 5: Escolha de Plano */}
            {currentStep === 5 && (
              <div className="space-y-3 sm:space-y-4 animate-fade-in">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium">Escolha seu Plano</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Escolha um plano ou continue com o gratuito
                  </p>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {plans.map((plan) => (
                    <div 
                      key={plan.name}
                      className={`p-3 sm:p-4 border rounded-lg ${
                        plan.name === 'Pro' ? 'border-2 border-primary bg-primary/5' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base">{plan.name}</h4>
                          <p className="text-xl sm:text-2xl font-bold">
                            {plan.price}
                            <span className="text-xs sm:text-sm font-normal text-muted-foreground">/mês</span>
                          </p>
                        </div>
                        {plan.name === 'Pro' && (
                          <Badge className="bg-primary text-xs">Recomendado</Badge>
                        )}
                      </div>
                      <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={() => handleSelectPlan(plan.name)}
                        disabled={isCompletingOnboarding || loading}
                        className="w-full text-xs sm:text-sm"
                        variant={plan.name === 'Free' ? 'outline' : 'default'}
                      >
                        {isCompletingOnboarding ? (
                          <>
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : plan.name === 'Free' ? (
                          'Continuar com Gratuito'
                        ) : (
                          <>
                            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Escolher {plan.name}
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
                  Você pode atualizar ou cancelar seu plano a qualquer momento
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 sm:pt-6">
              {currentStep > 1 && currentStep < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                  disabled={isLoading || loading || isCompletingOnboarding}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
              
              {/* Skip button - show after step 2 for product step */}
              {canSkipProduct && currentStep > 2 && currentStep < 5 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={skipToFinish}
                  disabled={isLoading || loading || isCompletingOnboarding}
                  className="text-muted-foreground text-xs sm:text-sm"
                >
                  {isCompletingOnboarding ? 'Processando...' : 'Pular por agora'}
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={isLoading || loading || isCompletingOnboarding}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : null}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};