import { useState, useEffect } from "react";
import { User, Save, Camera, Palette, Store, MessageCircle, Instagram, Smartphone, Layout, Crown, CreditCard, CheckCircle, ExternalLink, RefreshCw, Receipt, Download, XCircle, AlertCircle, Calendar, Grid3x3, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { usePlans } from "@/hooks/usePlans";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanCard } from "@/components/PlanCard";
import { PlanFeatureRestriction } from "@/components/PlanFeatureRestriction";
import { ImageUploadField } from "@/components/ImageUploadField";
import { StripeDebugPanel } from "@/components/StripeDebugPanel";
import { MultipleSubscriptionsInfo } from "@/components/MultipleSubscriptionsInfo";
import { CancellationDialog } from "@/components/CancellationDialog";
import { SecuritySettings } from "@/components/SecuritySettings";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const { plans, canAccessFeature, getPlanName } = usePlans();
  const { subscription, loading: subscriptionLoading, checkSubscription, openCustomerPortal, cancelSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [isLoading, setIsLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    store_name: '',
    store_url: '',
    store_description: '',
    background_color: '#ffffff',
    background_type: 'color' as 'color' | 'image',
    background_image_url: '',
    custom_background_enabled: false,
    profile_photo_url: '',
    whatsapp_number: '',
    custom_whatsapp_message: 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
    instagram_url: '',
    catalog_theme: 'light' as 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset',
    catalog_layout: 'bottom' as 'overlay' | 'bottom',
    product_grid_layout: 'default' as 'default' | 'round' | 'instagram',
    hide_footer: false,
    is_verified: false,
    show_all_products_in_feed: false
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        store_name: profile.store_name || '',
        store_url: profile.store_url || '',
        store_description: profile.store_description || '',
        background_color: profile.background_color || '#ffffff',
        background_type: (profile as any).background_type || 'color',
        background_image_url: (profile as any).background_image_url || '',
        custom_background_enabled: (profile as any).custom_background_enabled || false,
        profile_photo_url: profile.profile_photo_url || '',
        whatsapp_number: profile.whatsapp_number?.toString() || '',
        custom_whatsapp_message: profile.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
        instagram_url: profile.instagram_url || '',
        catalog_theme: profile.catalog_theme || 'light',
        catalog_layout: profile.catalog_layout || 'bottom',
        product_grid_layout: (profile as any).product_grid_layout || 'default',
        hide_footer: (profile as any).hide_footer || false,
        is_verified: (profile as any).is_verified || false,
        show_all_products_in_feed: (profile as any).show_all_products_in_feed || false
      });
      
      // Load portal data when profile is available
      if (initialTab === 'portal') {
        checkSubscription();
        loadPaymentHistory();
      }
    }
  }, [profile, initialTab]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStoreUrlChange = (value: string) => {
    const formattedUrl = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
    
    handleInputChange('store_url', formattedUrl);
  };

  const handleWhatsAppNumberChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    handleInputChange('whatsapp_number', numbersOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.store_name.trim()) {
      toast({
        title: "Nome da loja obrigatório",
        description: "Por favor, preencha o nome da sua loja.",
        variant: "destructive",
      });
      return;
    }

    if (!canAccessFeature(profile, 'custom_store_url') && formData.store_url !== profile?.store_url) {
      toast({
        title: "Recurso premium",
        description: "Escolher URL da loja está disponível no plano Pro+.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.store_url.trim() || formData.store_url.length < 3) {
      toast({
        title: "URL da loja inválida",
        description: "A URL da loja deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        ...formData,
        whatsapp_number: formData.whatsapp_number ? parseInt(formData.whatsapp_number) : null
      };
      await updateProfile(updateData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewCatalog = () => {
    if (formData.store_url && formData.store_url.length >= 3) {
      window.open(`/catalog/${formData.store_url}`, '_blank');
    } else {
      toast({
        title: "URL da loja necessária",
        description: "Configure uma URL válida para visualizar seu catálogo.",
        variant: "destructive",
      });
    }
  };

  const handleSelectPlan = (planName: string) => {
    // Redirect to the dedicated Plans page for checkout
    window.location.href = '/dashboard/plans';
  };

  // Portal functions
  const loadPaymentHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase.functions.invoke('payment-history');
      if (error) throw error;
      setPaymentHistory(data?.payments || []);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRefreshStatus = async () => {
    await checkSubscription();
    await loadPaymentHistory();
    toast({
      title: "Status atualizado",
      description: "Informações de assinatura e pagamentos atualizadas com sucesso.",
    });
  };

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'usd' ? 'USD' : 'BRL'
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  const handleCancelSubscription = async () => {
    await cancelSubscription(false);
    setShowCancellationDialog(false);
    await checkSubscription();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize seu perfil e configure sua loja
          </p>
        </div>

        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="portal">Portal</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="debug" className="text-orange-600">
              <Bug className="h-4 w-4 mr-1" />
              Debug
            </TabsTrigger>
          </TabsList>

          {/* Tab de Perfil e Loja */}
          <TabsContent value="profile" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Suas informações básicas de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <ImageUploadField
                    id="profile_photo_url"
                    label="Foto de Perfil"
                    value={formData.profile_photo_url}
                    onChange={(url) => handleInputChange('profile_photo_url', url)}
                    uploadOptions={{
                      bucket: 'profile-photos',
                      maxSize: 5 * 1024 * 1024, // 5MB
                      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
                    }}
                    previewClassName="w-16 h-16 rounded-full object-cover"
                    placeholder="https://exemplo.com/foto.jpg"
                    description="Foto que aparecerá no seu catálogo (máx. 5MB)"
                    allowUrlInput={true}
                  />
                </CardContent>
              </Card>

              <Separator />

              {/* Configurações da Loja */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Configurações da Loja
                  </CardTitle>
                  <CardDescription>
                    Configure como sua loja aparecerá para os clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store_name">Nome da Loja *</Label>
                    <Input
                      id="store_name"
                      value={formData.store_name}
                      onChange={(e) => handleInputChange('store_name', e.target.value)}
                      placeholder="Nome da sua loja"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store_url">URL da Loja *</Label>
                    {!canAccessFeature(profile, 'custom_store_url') ? (
                      <PlanFeatureRestriction 
                        requiredPlan="pro_plus"
                        featureName="URL Personalizada da Loja"
                        description="No plano Pro+ você pode escolher uma URL personalizada para sua loja"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            mylinkbuy.com.br/catalog/
                          </span>
                          <Input
                            id="store_url"
                            value={formData.store_url}
                            onChange={(e) => handleStoreUrlChange(e.target.value)}
                            placeholder="minha-loja"
                            className="flex-1"
                            required
                            minLength={3}
                            maxLength={50}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Apenas letras minúsculas, números e hífens. Entre 3 e 50 caracteres.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store_description">Descrição da Loja</Label>
                    {!canAccessFeature(profile, 'bio_message') ? (
                      <PlanFeatureRestriction 
                        requiredPlan="pro"
                        featureName="Mensagem na Bio"
                        description="No plano Pro você pode configurar uma descrição personalizada para sua loja"
                      />
                    ) : (
                      <>
                        <Textarea
                          id="store_description"
                          value={formData.store_description}
                          onChange={(e) => handleInputChange('store_description', e.target.value)}
                          placeholder="Descreva sua loja e seus produtos..."
                          rows={3}
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.store_description.length}/500 caracteres
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Configurações de Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Configurações de Contato
                  </CardTitle>
                  <CardDescription>
                    Configure como os clientes podem entrar em contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">Número do WhatsApp</Label>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsapp_number"
                        value={formData.whatsapp_number}
                        onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
                        placeholder="5511999999999"
                        type="tel"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Digite apenas números. Exemplo: 5511999999999 (código do país + DDD + número)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_whatsapp_message">Mensagem Personalizada do WhatsApp</Label>
                    {!canAccessFeature(profile, 'custom_whatsapp_message') ? (
                      <PlanFeatureRestriction 
                        requiredPlan="pro"
                        featureName="Mensagem Personalizada WhatsApp"
                        description="No plano Pro você pode personalizar a mensagem que será enviada via WhatsApp"
                      />
                    ) : (
                      <>
                        <Textarea
                          id="custom_whatsapp_message"
                          value={formData.custom_whatsapp_message}
                          onChange={(e) => handleInputChange('custom_whatsapp_message', e.target.value)}
                          placeholder="Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos."
                          rows={3}
                          maxLength={300}
                        />
                        <p className="text-xs text-muted-foreground">
                          Mensagem que será enviada quando clicarem no botão "Mensagem" do catálogo. {formData.custom_whatsapp_message.length}/300 caracteres
                        </p>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">URL do Instagram</Label>
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="instagram_url"
                        value={formData.instagram_url}
                        onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                        placeholder="https://instagram.com/seuusuario"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Link do seu perfil no Instagram (usado no botão "Seguir" do catálogo)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handlePreviewCatalog}
                  disabled={!formData.store_url || formData.store_url.length < 3}
                >
                  Visualizar Catálogo
                </Button>
                <Button 
                  type="submit" 
                  className="btn-hero"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Tab de Personalização Visual */}
          <TabsContent value="visual" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Personalização Visual
                  </CardTitle>
                  <CardDescription>
                    Customize a aparência do seu catálogo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="catalog_theme">Tema do Catálogo</Label>
                    {!canAccessFeature(profile, 'catalog_theme') ? (
                      <PlanFeatureRestriction 
                        requiredPlan="pro"
                        featureName="Temas Personalizados"
                        description="No plano Pro você pode escolher entre diferentes temas para seu catálogo"
                      />
                    ) : (
                      <Select value={formData.catalog_theme} onValueChange={(value: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset') => handleInputChange('catalog_theme', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro (Branco e Cinza)</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="beige">Bege</SelectItem>
                          <SelectItem value="rose">Rosa</SelectItem>
                          <SelectItem value="gold">Dourado</SelectItem>
                          <SelectItem value="purple">Roxo</SelectItem>
                          <SelectItem value="mint">Verde Menta</SelectItem>
                          <SelectItem value="sunset">Por do Sol</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catalog_layout">Layout dos Produtos</Label>
                    <Select value={formData.catalog_layout} onValueChange={(value: 'overlay' | 'bottom') => handleInputChange('catalog_layout', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom">Titulo/Preço visível no feed</SelectItem>
                        <SelectItem value="overlay">Titulo/Preço oculto no feed</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Escolha se deseja mostrar ou ocultar as informações dos produtos no grid principal
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product_grid_layout">Visualização da Grade</Label>
                    {!canAccessFeature(profile, 'grid_layout') ? (
                      <PlanFeatureRestriction 
                        requiredPlan="pro"
                        featureName="Layouts de Grade Personalizados"
                        description="No plano Pro você pode escolher diferentes estilos de visualização para seus produtos"
                      />
                    ) : (
                      <>
                        <Select value={formData.product_grid_layout} onValueChange={(value: 'default' | 'round' | 'instagram') => handleInputChange('product_grid_layout', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estilo da grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Padrão (Cards com bordas)</SelectItem>
                            <SelectItem value="round">Imagens Redondas (Título/preço abaixo)</SelectItem>
                            <SelectItem value="instagram">Estilo Instagram (Sem separação entre imagens)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Escolha como os produtos aparecerão na grade do catálogo
                        </p>
                      </>
                    )}
                  </div>

                  {canAccessFeature(profile, 'custom_background') && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-0.5">
                          <Label>Personalizar Plano de Fundo</Label>
                          <p className="text-xs text-muted-foreground">
                            Ative para usar cores/imagens personalizadas ou mantenha desativado para usar o fundo padrão do tema
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.custom_background_enabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, custom_background_enabled: e.target.checked }))}
                          className="h-4 w-4"
                        />
                      </div>

                      {formData.custom_background_enabled && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="background_type">Tipo de Fundo da Grade</Label>
                            <Select value={formData.background_type} onValueChange={(value: 'color' | 'image') => handleInputChange('background_type', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="color">Cor Sólida na Grade</SelectItem>
                                <SelectItem value="image">Imagem de Fundo na Grade</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Esta configuração será aplicada apenas na área da grade de produtos/links, não na página inteira
                            </p>
                          </div>

                          {formData.background_type === 'color' && (
                            <div className="space-y-2">
                              <Label htmlFor="background_color">Cor de Fundo da Grade</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id="background_color"
                                  type="color"
                                  value={formData.background_color}
                                  onChange={(e) => handleInputChange('background_color', e.target.value)}
                                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                                />
                                <Input
                                  value={formData.background_color}
                                  onChange={(e) => handleInputChange('background_color', e.target.value)}
                                  placeholder="#ffffff"
                                  pattern="^#[0-9A-Fa-f]{6}$"
                                  className="flex-1"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Cor de fundo aplicada apenas na área da grade de produtos/links
                              </p>
                            </div>
                          )}

                          {formData.background_type === 'image' && (
                            <div className="space-y-2">
                              <ImageUploadField
                                id="background_image_url"
                                label="URL da Imagem de Fundo da Grade"
                                value={formData.background_image_url}
                                onChange={(url) => handleInputChange('background_image_url', url)}
                                uploadOptions={{
                                  bucket: 'background-images',
                                  maxSize: 10 * 1024 * 1024, // 10MB
                                  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
                                }}
                                previewClassName="w-24 h-32 object-cover"
                                placeholder="https://exemplo.com/imagem-fundo.jpg"
                                description="Imagem de fundo aplicada apenas na área da grade de produtos/links (recomendado: 800x600px, máx. 10MB)"
                                allowUrlInput={true}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {!canAccessFeature(profile, 'custom_background') && (
                    <PlanFeatureRestriction 
                      requiredPlan="pro"
                      featureName="Planos de Fundo Personalizados"
                      description="No plano Pro você pode personalizar as cores e imagens de fundo do seu catálogo"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Configurações Avançadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Configurações Avançadas
                  </CardTitle>
                  <CardDescription>
                    Personalizações especiais para seu catálogo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Esconder rodapé "Criado com ❤️ no MyLinkBuy"</Label>
                      <p className="text-xs text-muted-foreground">
                        Remove o rodapé de crédito do catálogo
                      </p>
                    </div>
                    {canAccessFeature(profile, 'hide_footer') ? (
                      <input
                        type="checkbox"
                        checked={formData.hide_footer}
                        onChange={(e) => setFormData(prev => ({ ...prev, hide_footer: e.target.checked }))}
                        className="h-4 w-4"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/dashboard/plans'}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Pro+
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label>Selo de verificado</Label>
                        {formData.is_verified && (
                          <img 
                            src="/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png" 
                            alt="Verificado" 
                            className="w-4 h-4 object-contain"
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Exibe um selo azul ao lado do nome da loja para maior credibilidade
                      </p>
                    </div>
                    {canAccessFeature(profile, 'verified_badge') ? (
                      <input
                        type="checkbox"
                        checked={formData.is_verified}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                        className="h-4 w-4"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/dashboard/plans'}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Verificado
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Catálogo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid3x3 className="h-5 w-5" />
                    Configurações do Feed de Produtos
                  </CardTitle>
                  <CardDescription>
                    Configure como os produtos são exibidos no feed principal do catálogo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exibir todos os produtos no feed principal</Label>
                      <p className="text-xs text-muted-foreground">
                        Quando ativado, exibe todos os produtos no feed principal. Quando desativado, exibe apenas produtos sem categoria no feed, deixando os categorizados apenas em suas respectivas seções.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.show_all_products_in_feed}
                      onChange={(e) => setFormData(prev => ({ ...prev, show_all_products_in_feed: e.target.checked }))}
                      className="h-4 w-4"
                    />
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                    <h4 className="font-medium mb-2">💡 Como usar esta configuração:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><strong>• Ativado:</strong> Ideal para lojas com poucos produtos ou que querem máxima visibilidade</li>
                      <li><strong>• Desativado:</strong> Ideal para lojas organizadas por categorias, mantém o feed principal limpo</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handlePreviewCatalog}
                  disabled={!formData.store_url || formData.store_url.length < 3}
                >
                  Visualizar Catálogo
                </Button>
                <Button 
                  type="submit" 
                  className="btn-hero"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Tab de Planos */}
          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Gerenciar Assinatura</h2>
              <p className="text-muted-foreground">
                Gerencie seu plano atual e explore outras opções
              </p>
            </div>

            {/* Informações das assinaturas ativas */}
            <MultipleSubscriptionsInfo />

            {profile && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-sm">
                    <strong>Plano atual:</strong> {getPlanName(profile.subscription_plan)}
                  </p>
                  {profile.subscription_plan !== 'free' && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>
                {profile.subscription_expires_at && (
                  <p className="text-xs text-muted-foreground text-center">
                    Expira em {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            )}

            {/* Customer Portal for Subscribers */}
            {profile?.subscription_plan !== 'free' && (
              <Card className="border-blue-200 bg-blue-50 mb-6">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CreditCard className="h-8 w-8 text-blue-600 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">
                        Gerenciar Assinatura
                      </h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Acesse o portal do cliente para alterar forma de pagamento, ver faturas ou cancelar sua assinatura.
                      </p>
                    </div>
                    <Button 
                      onClick={openCustomerPortal} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Portal do Cliente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.name}
                  plan={plan}
                  isCurrentPlan={profile ? getPlanName(profile.subscription_plan) === plan.name : false}
                  onSelectPlan={() => handleSelectPlan(plan.name)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Tab de Portal do Cliente */}
          <TabsContent value="portal" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Portal do Cliente</h2>
                <p className="text-muted-foreground">
                  Gerencie sua assinatura e histórico de pagamentos
                </p>
              </div>
              <Button variant="outline" onClick={handleRefreshStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {/* Current Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Status da Assinatura Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{getPlanName(profile?.subscription_plan || 'free')}</h3>
                      {subscription?.subscribed && profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date() ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : profile?.subscription_expires_at && new Date(profile.subscription_expires_at) < new Date() ? (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expirado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Gratuito
                        </Badge>
                      )}
                    </div>
                    
                    {profile?.subscription_expires_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(profile.subscription_expires_at) < new Date() ? 'Expirou em: ' : 'Próxima cobrança: '}
                          {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {subscription?.subscribed && (
                      <>
                        <Button onClick={openCustomerPortal} className="gap-2" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                          Gerenciar no Stripe
                        </Button>
                        <Button 
                          onClick={() => setShowCancellationDialog(true)} 
                          variant="outline"
                          className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancelar Assinatura
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {(profile?.subscription_plan && profile.subscription_plan !== 'free') && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Recursos inclusos no seu plano:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {plans.find(p => p.name.toLowerCase().replace(/\s+/g, '_').replace('+', '_plus') === profile.subscription_plan?.replace('_plus', '_plus'))?.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancellation Notice */}
                {subscription?.subscription_end && new Date(subscription.subscription_end) > new Date() && (
                  <div className="pt-4 border-t">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 mb-1">
                            Assinatura Cancelada
                          </h4>
                          <p className="text-sm text-red-700">
                            Sua assinatura foi cancelada e encerrará em{' '}
                            <strong>{new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}</strong>.
                            Após essa data, sua conta retornará ao plano gratuito.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Histórico de Pagamentos
                </CardTitle>
                <CardDescription>
                  Visualize todas as suas transações e faturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                    <span>Carregando histórico...</span>
                  </div>
                ) : paymentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatCurrency(payment.amount, payment.currency)}
                            </span>
                            <Badge 
                              variant={payment.status === 'paid' ? 'default' : 'secondary'}
                              className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payment.created)} • {payment.description || 'Assinatura'}
                          </p>
                        </div>
                        {payment.invoice_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Fatura
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pagamento encontrado</p>
                    <p className="text-sm">Seus pagamentos aparecerão aqui quando realizados</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Gerenciar Assinatura</h4>
                    <p className="text-sm text-muted-foreground">
                      Altere seu plano, atualize forma de pagamento ou gerencie sua assinatura
                    </p>
                    {subscription?.subscribed ? (
                      <Button variant="outline" onClick={openCustomerPortal} className="w-full sm:w-auto">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir Portal do Stripe
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => window.location.href = '/dashboard/plans'} className="w-full sm:w-auto">
                        <Crown className="h-4 w-4 mr-2" />
                        Ver Planos Disponíveis
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Debug Panel */}
          <TabsContent value="debug" className="space-y-6">
            <StripeDebugPanel />
          </TabsContent>
        </Tabs>

        <CancellationDialog
          open={showCancellationDialog}
          onOpenChange={setShowCancellationDialog}
          onConfirmCancel={handleCancelSubscription}
          planName={getPlanName(profile?.subscription_plan || 'free')}
          expirationDate={profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR') : undefined}
        />
      </div>
    </DashboardLayout>
  );
};

export default Settings;