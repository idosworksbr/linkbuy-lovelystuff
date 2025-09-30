import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Instagram, ShieldCheck, Link2, ArrowLeft, Info } from 'lucide-react';
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
      <div className={cn("pt-8 pb-6 px-4", themeClasses.text)}>
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Foto de Perfil (Emoji) */}
            <div className="w-24 h-24 rounded-full bg-card border-4 border-border flex items-center justify-center text-5xl shadow-lg">
              {profile.emoji}
            </div>

            {/* Nome da Loja */}
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{profile.storeName}</h1>
              {profile.isVerified && (
                <ShieldCheck className="w-6 h-6 text-whatsapp fill-whatsapp" />
              )}
            </div>

            {/* Descrição */}
            {profile.description && (
              <p className={cn("text-base max-w-md", themeClasses.textMuted)}>
                {profile.description}
              </p>
            )}

            {/* Botões de Contato */}
            <div className="flex gap-3 pt-2">
              {profile.whatsapp && (
                <Button className="whatsapp-btn">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </Button>
              )}
              {profile.instagram && (
                <Button variant="outline" className="gap-2">
                  <Instagram className="w-5 h-5" />
                  Instagram
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className={cn("sticky top-[52px] z-40 border-b border-border", themeClasses.header)} style={{ backdropFilter: 'blur(8px)' }}>
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('products')}
              className={cn(
                "flex-1 py-3 px-4 font-medium transition-all",
                activeTab === 'products'
                  ? "text-whatsapp border-b-2 border-whatsapp"
                  : cn("text-muted-foreground hover:text-foreground")
              )}
            >
              Produtos ({products.length})
            </button>
            {customLinks.length > 0 && (
                <button
                onClick={() => setActiveTab('links')}
                className={cn(
                  "flex-1 py-3 px-4 font-medium transition-all",
                  activeTab === 'links'
                    ? "text-whatsapp border-b-2 border-whatsapp"
                    : cn(themeClasses.textMuted, "hover:opacity-80")
                )}
              >
                Links ({customLinks.length})
              </button>
            )}
            {categories.length > 0 && (
              <button
                onClick={() => setActiveTab('categories')}
                className={cn(
                  "flex-1 py-3 px-4 font-medium transition-all",
                  activeTab === 'categories'
                    ? "text-whatsapp border-b-2 border-whatsapp"
                    : cn(themeClasses.textMuted, "hover:opacity-80")
                )}
              >
                Categorias ({categories.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Grid de Produtos */}
        {activeTab === 'products' && (
          <div className={cn(
            "grid gap-4",
            profile.gridStyle === 'instagram' ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          )}>
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
