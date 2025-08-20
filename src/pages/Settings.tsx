
import { useState, useEffect } from "react";
import { User, Save, Camera, Palette, Store, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    profile_photo_url: '',
    whatsapp_number: ''
  });

  // Atualizar formData quando o profile carregar
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        store_name: profile.store_name || '',
        store_url: profile.store_url || '',
        store_description: profile.store_description || '',
        background_color: profile.background_color || '#ffffff',
        profile_photo_url: profile.profile_photo_url || '',
        whatsapp_number: profile.whatsapp_number || ''
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

  const handleWhatsAppChange = (value: string) => {
    // Remove tudo que não seja número
    const numbersOnly = value.replace(/\D/g, '');
    handleInputChange('whatsapp_number', numbersOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
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

    // Validação do WhatsApp
    if (formData.whatsapp_number && (formData.whatsapp_number.length < 10 || formData.whatsapp_number.length > 11)) {
      toast({
        title: "Número do WhatsApp inválido",
        description: "Digite um número válido com DDD (10 ou 11 dígitos).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile(formData);
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
        {/* Header */}
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
                <Label htmlFor="whatsapp_number">Número do WhatsApp</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">+55</span>
                  <Input
                    id="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    placeholder="11999999999"
                    className="flex-1"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Digite apenas números (DDD + número). Ex: 11999999999
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
                  Escolha a cor de fundo que será usada no seu catálogo público
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
      </div>
    </DashboardLayout>
  );
};

export default Settings;
