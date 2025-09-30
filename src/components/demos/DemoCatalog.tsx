import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Instagram, ShieldCheck, Link2, ArrowLeft, Info, Grid3x3, List, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoProduct, DemoProductData } from './DemoProduct';
import { cn } from '@/lib/utils';
import { useThemeClasses } from '@/components/CatalogTheme';

interface DemoProfile {
  storeName: string;
  emoji: string;
  description?: string;
  whatsapp?: string;
  instagram?: string;
  isVerified?: boolean;
  theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  layout: 'overlay' | 'bottom';
  gridStyle: 'default' | 'round' | 'instagram';
  backgroundColor?: string;
  backgroundType?: 'color' | 'gradient';
  textBackgroundEnabled?: boolean;
  textBackgroundColor?: string;
  textBackgroundOpacity?: number;
  nameTextColor?: string;
  priceTextColor?: string;
}

interface DemoCategory {
  id: string;
  name: string;
  emoji: string;
}

interface DemoCustomLink {
  id: string;
  title: string;
  url: string;
  icon: string;
}

interface DemoCatalogProps {
  profile: DemoProfile;
  products: DemoProductData[];
  categories?: DemoCategory[];
  customLinks?: DemoCustomLink[];
}

export const DemoCatalog: React.FC<DemoCatalogProps> = ({
  profile,
  products,
  categories = [],
  customLinks = [],
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'links' | 'categories'>('products');
  const themeClasses = useThemeClasses(profile.theme);

  const getBackgroundStyle = () => {
    if (profile.backgroundType === 'gradient') {
      return {
        background: profile.backgroundColor || 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--muted)) 100%)',
      };
    }
    return {
      backgroundColor: profile.backgroundColor || 'hsl(var(--background))',
    };
  };

  const filteredProducts = activeTab === 'products' ? products : [];

  return (
    <div className={cn("min-h-screen", themeClasses.container)} style={getBackgroundStyle()}>
      {/* Banner de Demo */}
      <div className="sticky top-0 z-50 bg-whatsapp text-whatsapp-foreground py-3 px-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            <span className="text-sm font-medium">🎨 Este é um catálogo de demonstração</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-white text-whatsapp hover:bg-white/90 font-semibold"
            >
              Criar Meu Catálogo
            </Button>
          </div>
        </div>
      </div>

      {/* Header do Perfil */}
      <div className="px-4 pt-6 pb-4">
        <div className="container mx-auto max-w-4xl">
          {/* Linha superior: Foto + Info + Compartilhar */}
          <div className="flex items-start gap-4 mb-4">
            {/* Foto de Perfil */}
            <div className="w-20 h-20 rounded-2xl bg-card border-4 border-white shadow-lg flex items-center justify-center text-4xl flex-shrink-0">
              {profile.emoji}
            </div>

            {/* Nome e Métricas */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className={cn("text-xl font-bold", themeClasses.text)}>{profile.storeName}</h1>
                {profile.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500 flex-shrink-0" />
                )}
              </div>

              {/* Métricas em linha */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex flex-col items-center">
                  <span className={cn("font-bold", themeClasses.text)}>{products.length}</span>
                  <span className={cn("text-xs", themeClasses.textMuted)}>Produtos</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={cn("font-bold", themeClasses.text)}>
                    {Math.floor(Math.random() * 500) + 100}
                  </span>
                  <span className={cn("text-xs", themeClasses.textMuted)}>Visualizações</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={cn("font-bold", themeClasses.text)}>
                    {Math.floor(Math.random() * 50) + 10}
                  </span>
                  <span className={cn("text-xs", themeClasses.textMuted)}>Conversas</span>
                </div>
              </div>
            </div>

            {/* Botão Compartilhar */}
            <Button size="icon" variant="ghost" className="flex-shrink-0">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Descrição */}
          {profile.description && (
            <p className={cn("text-sm mb-4", themeClasses.text)}>
              {profile.description}
            </p>
          )}

          {/* Botões de Contato */}
          <div className="flex gap-2">
            {profile.instagram && (
              <Button className="flex-1 gap-2" variant="default">
                <Instagram className="w-4 h-4" />
                Seguir
              </Button>
            )}
            {profile.whatsapp && (
              <Button className="flex-1 gap-2" variant="outline">
                <MessageCircle className="w-4 h-4" />
                Mensagem
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Seção de Categorias */}
      {categories.length > 0 && (
        <div className="px-4 py-4 border-t border-border">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className={cn("font-semibold", themeClasses.text)}>Categorias</h2>
              <button 
                onClick={() => setActiveTab('categories')}
                className={cn("text-sm", themeClasses.textMuted, "hover:opacity-80")}
              >
                Ver todas
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.slice(0, 6).map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center text-2xl hover:scale-105 transition-transform">
                    {category.emoji}
                  </div>
                  <span className={cn("text-xs text-center line-clamp-1", themeClasses.text)}>
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs de Navegação - Ícones */}
      <div className={cn("sticky top-[52px] z-40 border-t border-b border-border bg-background/80")} style={{ backdropFilter: 'blur(8px)' }}>
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-12 py-4">
            <button
              onClick={() => setActiveTab('products')}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                activeTab === 'products' && "relative"
              )}
            >
              <Grid3x3 className={cn(
                "w-6 h-6",
                activeTab === 'products' ? "text-foreground" : "text-muted-foreground"
              )} />
              {activeTab === 'products' && (
                <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>

            {customLinks.length > 0 && (
              <button
                onClick={() => setActiveTab('links')}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  activeTab === 'links' && "relative"
                )}
              >
                <Link2 className={cn(
                  "w-6 h-6",
                  activeTab === 'links' ? "text-foreground" : "text-muted-foreground"
                )} />
                {activeTab === 'links' && (
                  <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-foreground" />
                )}
              </button>
            )}

            {categories.length > 0 && (
              <button
                onClick={() => setActiveTab('categories')}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  activeTab === 'categories' && "relative"
                )}
              >
                <List className={cn(
                  "w-6 h-6",
                  activeTab === 'categories' ? "text-foreground" : "text-muted-foreground"
                )} />
                {activeTab === 'categories' && (
                  <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-foreground" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Grid de Produtos */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <DemoProduct
                key={product.id}
                product={product}
                layout={profile.layout}
                gridStyle={profile.gridStyle}
                theme={profile.theme}
                textBackgroundEnabled={profile.textBackgroundEnabled}
                textBackgroundColor={profile.textBackgroundColor}
                textBackgroundOpacity={profile.textBackgroundOpacity}
                nameTextColor={profile.nameTextColor}
                priceTextColor={profile.priceTextColor}
              />
            ))}
          </div>
        )}

        {/* Lista de Links Personalizados */}
        {activeTab === 'links' && customLinks.length > 0 && (
          <div className="space-y-3">
            {customLinks.map((link) => (
              <div
                key={link.id}
                className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-all cursor-pointer hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{link.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{link.title}</h3>
                  </div>
                  <Link2 className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid de Categorias */}
        {activeTab === 'categories' && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-card border border-border rounded-lg p-6 hover:bg-accent/30 transition-all cursor-pointer hover:shadow-md flex flex-col items-center justify-center text-center space-y-2"
              >
                <div className="text-4xl">{category.emoji}</div>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn("py-6 text-center", themeClasses.header, themeClasses.textMuted)}>
        <p className="text-sm">
          Feito com ❤️ por <span className="font-semibold text-whatsapp">MyLinkBuy</span>
        </p>
      </div>
    </div>
  );
};
