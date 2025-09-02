import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CatalogTheme, useThemeClasses } from '@/components/CatalogTheme';
import { DiscountAnimation } from '@/components/DiscountAnimation';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Palette, Layout, Sparkles, Eye, Shuffle } from 'lucide-react';

const mockProducts = [
  {
    id: '1',
    name: 'Tênis Esportivo Premium',
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    images: ['/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png'],
    description: 'Tênis de alta performance com tecnologia avançada de amortecimento.',
    code: 'TNS-001',
    weight: '450g',
    category: 'Calçados'
  },
  {
    id: '2',
    name: 'Camiseta Básica Cotton',
    price: 49.99,
    images: ['/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png'],
    description: 'Camiseta 100% algodão, confortável e versátil para o dia a dia.',
    code: 'CAM-002',
    weight: '180g',
    category: 'Roupas'
  },
  {
    id: '3',
    name: 'Relógio Digital Smart',
    price: 899.99,
    originalPrice: 1199.99,
    discount: 25,
    images: ['/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png'],
    description: 'Smartwatch com GPS, monitor cardíaco e resistente à água.',
    code: 'REL-003',
    weight: '65g',
    category: 'Eletrônicos'
  },
  {
    id: '4',
    name: 'Mochila Adventure',
    price: 159.99,
    images: ['/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png'],
    description: 'Mochila resistente e espaçosa, ideal para aventuras e viagens.',
    code: 'MCH-004',
    weight: '800g',
    category: 'Acessórios'
  }
];

export default function CatalogDemo() {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset'>('light');
  const [gridLayout, setGridLayout] = useState<'default' | 'round' | 'instagram'>('default');
  const [showDiscountAnimation, setShowDiscountAnimation] = useState(true);
  const themeClasses = useThemeClasses(selectedTheme);

  const ProductCard = ({ product }: { product: typeof mockProducts[0] }) => {
    const hasDiscount = product.discount && product.discount > 0;
    
    return (
      <DiscountAnimation 
        enabled={hasDiscount && showDiscountAnimation}
        color={selectedTheme === 'dark' ? '#60a5fa' : '#3b82f6'}
        className="group cursor-pointer"
      >
        <Card className={`${themeClasses.card} transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
          <div className="aspect-square overflow-hidden">
            <img 
              src={product.images[0]} 
              alt={product.name}
              className={`w-full h-full object-cover ${
                gridLayout === 'round' ? 'rounded-full p-4' : 
                gridLayout === 'instagram' ? 'rounded-lg' : ''
              }`}
            />
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className={`font-semibold ${themeClasses.text} line-clamp-2`}>
                {product.name}
              </h3>
              
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    -{product.discount}%
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${themeClasses.text}`}>
                    R$ {product.price.toFixed(2)}
                  </span>
                  {hasDiscount && product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {product.code && <div>Código: {product.code}</div>}
                  {product.weight && <div>Peso: {product.weight}</div>}
                </div>
              </div>

              <p className={`text-sm ${themeClasses.text} opacity-80 line-clamp-2`}>
                {product.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </DiscountAnimation>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <CatalogTheme theme={selectedTheme}>
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Demonstração de Catálogo</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore diferentes temas, layouts e personalizações para seu catálogo
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Theme Selector */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="w-5 h-5" />
                  Tema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeSelector 
                  selectedTheme={selectedTheme}
                  onThemeChange={setSelectedTheme}
                />
              </CardContent>
            </Card>

            {/* Layout Selector */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layout className="w-5 h-5" />
                  Layout dos Produtos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={gridLayout === 'default' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGridLayout('default')}
                  className="w-full justify-start"
                >
                  Padrão
                </Button>
                <Button
                  variant={gridLayout === 'round' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGridLayout('round')}
                  className="w-full justify-start"
                >
                  Circular
                </Button>
                <Button
                  variant={gridLayout === 'instagram' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGridLayout('instagram')}
                  className="w-full justify-start"
                >
                  Instagram
                </Button>
              </CardContent>
            </Card>

            {/* Animation Controls */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5" />
                  Animações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={showDiscountAnimation ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowDiscountAnimation(!showDiscountAnimation)}
                  className="w-full justify-start"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {showDiscountAnimation ? 'Desativar' : 'Ativar'} Animação de Desconto
                </Button>
                
                <div className="pt-2 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTheme(
                      ['light', 'dark', 'beige', 'rose', 'gold', 'purple', 'mint', 'sunset'][
                        Math.floor(Math.random() * 8)
                      ] as any
                    )}
                    className="w-full justify-start"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Tema Aleatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Badge */}
          <div className="flex items-center justify-center mb-6">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Eye className="w-4 h-4 mr-2" />
              Prévia - Tema: {selectedTheme} | Layout: {gridLayout}
            </Badge>
          </div>

          {/* Products Grid */}
          <div className={`
            grid gap-6
            ${gridLayout === 'instagram' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 
              'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}
          `}>
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Demo Info */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">🚀 Funcionalidades Demonstradas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div>✨ Temas personalizáveis</div>
                    <div>🎨 Layouts de grade flexíveis</div>
                    <div>💫 Animações de desconto</div>
                    <div>🏷️ Informações detalhadas</div>
                  </div>
                  <div className="space-y-2">
                    <div>📱 Design responsivo</div>
                    <div>🎯 Cards interativos</div>
                    <div>🔄 Alternância dinâmica</div>
                    <div>⚡ Performance otimizada</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CatalogTheme>
    </div>
  );
}