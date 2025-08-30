
import { useState, useEffect } from "react";
import { User, Save, Camera, Palette, Store, MessageCircle, Instagram, Smartphone, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    store_name: '',
    store_url: '',
    store_description: '',
    background_color: '#ffffff',
    background_type: 'color' as 'color' | 'image',
    background_image_url: '',
    profile_photo_url: '',
    whatsapp_number: '',
    custom_whatsapp_message: 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
    instagram_url: '',
    catalog_theme: 'light' as 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset',
    catalog_layout: 'overlay' as 'overlay' | 'bottom',
    hide_footer: false,
    is_verified: false
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
        profile_photo_url: profile.profile_photo_url || '',
        whatsapp_number: profile.whatsapp_number?.toString() || '',
        custom_whatsapp_message: profile.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
        instagram_url: profile.instagram_url || '',
        catalog_theme: profile.catalog_theme || 'light',
        catalog_layout: profile.catalog_layout || 'overlay',
        hide_footer: (profile as any).hide_footer || false,
        is_verified: (profile as any).is_verified || false
      });
    }
  }, [profile]);

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

              <div className="space-y-2">
                <Label htmlFor="profile_photo_url">URL da Foto de Perfil</Label>
                <div className="flex gap-2">
                  <Input
                    id="profile_photo_url"
                    value={formData.profile_photo_url}
                    onChange={(e) => handleInputChange('profile_photo_url', e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                {formData.profile_photo_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.profile_photo_url} 
                      alt="Prévia" 
                      className="w-16 h-16 rounded-full object-cover border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    linkbuy.com/catalog/
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_description">Descrição da Loja</Label>
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

          <Separator />

          {/* Personalização Visual */}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="catalog_layout">Layout dos Produtos</Label>
                <Select value={formData.catalog_layout} onValueChange={(value: 'overlay' | 'bottom') => handleInputChange('catalog_layout', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overlay">Título/Preço sobre a imagem (atual)</SelectItem>
                    <SelectItem value="bottom">Título/Preço abaixo da imagem</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  No layout "bottom", o nome será preto com sombra e o preço verde escuro com sombra para melhor contraste
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_type">Tipo de Fundo</Label>
                <Select value={formData.background_type} onValueChange={(value: 'color' | 'image') => handleInputChange('background_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Cor Sólida</SelectItem>
                    <SelectItem value="image">Imagem de Fundo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.background_type === 'color' && (
                <div className="space-y-2">
                  <Label htmlFor="background_color">Cor de Fundo do Catálogo</Label>
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
                    Cor de fundo externa do catálogo (apenas para tema claro)
                  </p>
                </div>
              )}

              {formData.background_type === 'image' && (
                <div className="space-y-2">
                  <Label htmlFor="background_image_url">URL da Imagem de Fundo</Label>
                  <Input
                    id="background_image_url"
                    value={formData.background_image_url}
                    onChange={(e) => handleInputChange('background_image_url', e.target.value)}
                    placeholder="https://exemplo.com/imagem-fundo.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Imagem de fundo do catálogo (recomendado: 1080x1920px)
                  </p>
                  {formData.background_image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.background_image_url} 
                        alt="Prévia do fundo" 
                        className="w-24 h-32 object-cover border rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

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
                  <Label>Esconder rodapé "Criado com ❤️ no LinkBuy"</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove o rodapé de crédito do catálogo
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hide_footer}
                  onChange={(e) => setFormData(prev => ({ ...prev, hide_footer: e.target.checked }))}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Selo de verificado</Label>
                  <p className="text-xs text-muted-foreground">
                    Exibe um selo ao lado do nome da loja (apenas para contas verificadas)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  disabled
                  className="h-4 w-4 opacity-50"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> O selo de verificado é concedido após análise manual. 
                  Entre em contato conosco para solicitar a verificação da sua loja.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

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
      </div>
    </DashboardLayout>
  );
};

export default Settings;
