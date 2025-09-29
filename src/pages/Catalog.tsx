import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, Grid3X3, ArrowLeft, ExternalLink, Instagram, ShieldCheck, Link2, icons, Edit3, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CatalogTheme, useThemeClasses } from "@/components/CatalogTheme";
import { useAnalyticsTracker } from "@/hooks/useAnalytics";
import { CatalogEditDialog } from "@/components/CatalogEditDialog";
import { ShareButton } from "@/components/ShareButton";
import { DragDropProductGrid } from "@/components/DragDropProductGrid";
import { DiscountAnimation } from "@/components/DiscountAnimation";
import { useCatalogEdit } from "@/hooks/useCatalogEdit";
import { useReorderItems } from "@/hooks/useReorderItems";
import { ProductPreviewModal } from "@/components/ProductPreviewModal";
import { InstagramStyleProductGrid } from "@/components/InstagramStyleProductGrid";
import { DragDropCategoryGrid } from "@/components/DragDropCategoryGrid";
import { useLongPress } from "@/hooks/useLongPress";
import { useProfile } from "@/hooks/useProfile";
import { usePlans } from "@/hooks/usePlans";
import { getProductPrices } from "@/lib/priceUtils";
import { usePageTitle } from "@/hooks/usePageTitle";

interface StoreProfile {
  id: string;
  store_name: string;
  store_description: string | null;
  profile_photo_url: string | null;
  background_color: string;
  background_type?: 'color' | 'image';
  background_image_url?: string | null;
  custom_background_enabled?: boolean;
  store_url: string;
  whatsapp_number: number | null;
  custom_whatsapp_message: string;
  instagram_url: string | null;
  catalog_theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  catalog_layout: 'overlay' | 'bottom';
  product_grid_layout?: 'default' | 'round' | 'instagram';
  hide_footer?: boolean;
  is_verified?: boolean;
  show_all_products_in_feed?: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  created_at: string;
  category_id?: string | null;
  display_order?: number;
  discount?: number;
  discount_animation_enabled?: boolean;
  discount_animation_color?: string;
}

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  product_count?: number;
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  display_order: number;
}

interface CatalogData {
  store: StoreProfile;
  products: Product[];
  allProducts: Product[];
  categories: Category[];
  customLinks: CustomLink[];
  meta: {
    total_products: number;
    total_all_products: number;
    total_custom_links: number;
    total_categories: number;
    generated_at: string;
  };
}

interface StoreAnalytics {
  total_catalog_views: number;
  total_product_views: number;
  total_whatsapp_clicks: number;
  total_instagram_clicks: number;
  unique_visitors: number;
}

const Catalog = () => {
  const { storeUrl } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalyticsTracker();
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [storeAnalytics, setStoreAnalytics] = useState<StoreAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'links' | 'categories'>('products');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const theme = catalogData?.store.catalog_theme || 'light';
  const layout = catalogData?.store.catalog_layout || 'bottom';
  const themeClasses = useThemeClasses(theme);
  
  // Set dynamic page title
  usePageTitle(catalogData?.store ? `${catalogData.store.store_name} - MyLinkBuy` : undefined);
  
  // Hooks para edição e reordenação
  const { isEditMode, isOwner, toggleEditMode } = useCatalogEdit({ 
    storeId: catalogData?.store.id || '' 
  });
  const { reorderProducts, reorderCategories } = useReorderItems();
  const { profile, updateProfile } = useProfile();
  const { canAccessFeature } = usePlans();

  // Função robusta para verificar se o WhatsApp está disponível
  const isWhatsAppAvailable = () => {
    const whatsappNumber = catalogData?.store.whatsapp_number;

    // Verificação robusta: não pode ser null, undefined, 0, NaN ou string vazia
    if (whatsappNumber === null || whatsappNumber === undefined) {
      return false;
    }
    const numberValue = Number(whatsappNumber);
    if (isNaN(numberValue) || numberValue <= 0) {
      return false;
    }
    return true;
  };

  // Função robusta para verificar se o Instagram está disponível
  const isInstagramAvailable = () => {
    const instagramUrl = catalogData?.store.instagram_url;

    // Verificação robusta: não pode ser null, undefined ou string vazia
    if (!instagramUrl || typeof instagramUrl !== 'string' || instagramUrl.trim() === '') {
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchCatalogData = async () => {
      if (!storeUrl) {
        setError('URL da loja não foi fornecida');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://rpkawimruhfqhxbpavce.supabase.co/functions/v1/catalog/${storeUrl}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: 'Erro na resposta do servidor',
            message: 'Não foi possível carregar o catálogo'
          }));
          throw new Error(errorData.message || errorData.error || 'Loja não encontrada');
        }
        const data: CatalogData = await response.json();
        setCatalogData(data);
        
        // Track catalog view
        if (data.store.id) {
          trackEvent('catalog_view', data.store.id);
          
          // Fetch store analytics to show real metrics
          fetchStoreAnalytics(data.store.id);
        }
        
        toast({
          title: "Catálogo carregado!",
          description: `${data.meta.total_products} produtos encontrados`
        });
      } catch (error) {
        console.error('Error fetching catalog:', error);
        const errorMessage = error instanceof Error ? error.message : 'Não foi possível carregar o catálogo';
        setError(errorMessage);
        toast({
          title: "Erro ao carregar catálogo",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, [storeUrl, toast]);

  const fetchStoreAnalytics = async (storeId: string) => {
    try {
      const response = await fetch('https://rpkawimruhfqhxbpavce.supabase.co/rest/v1/rpc/get_store_analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwa2F3aW1ydWhmcWh4YnBhdmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTcwOTEsImV4cCI6MjA3MTIzMzA5MX0.XaMLFfKuOWDTuz4UMYv6tiKFlP3sYBeftAhhvvlNtdc'
        },
        body: JSON.stringify({
          store_id_param: storeId
        })
      });
      
      if (response.ok) {
        const analyticsData = await response.json();
        if (analyticsData && analyticsData.length > 0) {
          setStoreAnalytics(analyticsData[0]);
        }
      }
    } catch (error) {
      console.log('Error fetching analytics:', error);
      // Não mostramos erro pois analytics é opcional
    }
  };

  const handleWhatsAppContact = () => {
    if (!catalogData?.store) return;
    if (!isWhatsAppAvailable()) {
      toast({
        title: "WhatsApp não disponível",
        description: "Esta loja não configurou um número de WhatsApp válido.",
        variant: "destructive"
      });
      return;
    }
    
    // Track WhatsApp click
    trackEvent('whatsapp_click', catalogData.store.id);
    
    const phoneNumber = catalogData.store.whatsapp_number;
    const message = encodeURIComponent(catalogData.store.custom_whatsapp_message || 'Olá! Vi seu catálogo MyLinkBuy e gostaria de saber mais sobre seus produtos.');
    
    // Use the phone number exactly as registered in database
    const phoneStr = phoneNumber.toString();
    const whatsappUrl = `https://wa.me/${phoneStr}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInstagramFollow = () => {
    if (!catalogData?.store) return;
    if (!isInstagramAvailable()) {
      toast({
        title: "Instagram não disponível",
        description: "Esta loja não configurou um perfil do Instagram válido.",
        variant: "destructive"
      });
      return;
    }
    
    // Track Instagram click
    trackEvent('instagram_click', catalogData.store.id);
    
    window.open(catalogData.store.instagram_url, '_blank');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleCustomLinkClick = (link: CustomLink) => {
    if (catalogData?.store) {
      trackEvent('whatsapp_click', catalogData.store.id); // Using existing event type for now
    }
    window.open(link.url, '_blank');
  };

  const handleProductClick = (product: Product) => {
    if (isEditMode) return; // Não navegar se em modo de edição
    
    if (catalogData?.store) {
      trackEvent('product_view', catalogData.store.id, product.id);
    }
    navigate(`/catalog/${storeUrl}/product/${product.id}`);
  };

  const handleProductLongPress = (product: Product) => {
    if (isEditMode) return;
    setPreviewProduct(product);
    setIsPreviewOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    setIsPreviewOpen(false);
    if (!catalogData?.store) return;
    
    trackEvent('whatsapp_click', catalogData.store.id, product.id);
    
    if (!isWhatsAppAvailable()) {
      toast({
        title: "WhatsApp não disponível",
        description: "Esta loja não configurou um número de WhatsApp válido.",
        variant: "destructive"
      });
      return;
    }
    
    const phoneNumber = catalogData.store.whatsapp_number;
    const productMessage = `Olá! Vi o produto "${product.name}" no seu catálogo e gostaria de saber mais informações.`;
    const message = encodeURIComponent(productMessage);
    
    const phoneStr = phoneNumber.toString();
    const whatsappUrl = `https://wa.me/${phoneStr}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCategoryReorder = (categoryUpdates: Array<{ id: string; display_order: number }>) => {
    reorderCategories(categoryUpdates);
    
    // Atualizar ordem local das categorias
    if (catalogData) {
      const updatedCategories = catalogData.categories.map(category => {
        const update = categoryUpdates.find(u => u.id === category.id);
        return update ? { ...category, display_order: update.display_order } : category;
      }).sort((a, b) => a.display_order - b.display_order);
      
      setCatalogData({
        ...catalogData,
        categories: updatedCategories
      });
    }
  };

  const handleProductReorder = (productIds: string[]) => {
    reorderProducts(productIds);
    
    // Atualizar ordem local tanto nos produtos do feed quanto em todos os produtos
    if (catalogData) {
      const reorderedProducts = productIds.map((id, index) => {
        const product = catalogData.products.find(p => p.id === id);
        return product ? { ...product, display_order: index + 1 } : null;
      }).filter(Boolean) as Product[];
      
      const updatedAllProducts = catalogData.allProducts.map(product => {
        const newOrderIndex = productIds.indexOf(product.id);
        if (newOrderIndex !== -1) {
          return { ...product, display_order: newOrderIndex + 1 };
        }
        return product;
      }).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      
      setCatalogData({
        ...catalogData,
        products: reorderedProducts,
        allProducts: updatedAllProducts
      });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.container} flex items-center justify-center`}>
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${themeClasses.text} font-medium mb-2`}>Carregando catálogo...</p>
          <p className={`text-sm ${themeClasses.textMuted}`}>Loja: <span className="font-mono font-semibold">{storeUrl}</span></p>
        </div>
      </div>
    );
  }

  if (error || !catalogData) {
    return (
      <div className={`min-h-screen ${themeClasses.container} flex items-center justify-center`}>
        <div className={`text-center max-w-md mx-auto p-6 ${themeClasses.card} rounded-lg shadow-sm border`}>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="h-8 w-8 text-red-500" />
          </div>
          
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>Loja não encontrada</h1>
          
          <p className={`${themeClasses.textMuted} mb-4 leading-relaxed`}>
            {error || "A loja que você está procurando não existe ou foi removida."}
          </p>
          
          <div className={`${theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-4 mb-6 text-left`}>
            <p className={`text-sm ${themeClasses.textMuted} mb-2`}>Detalhes técnicos:</p>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">URL buscada:</span> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{storeUrl}</span></p>
              <p><span className="font-medium">Sugestão:</span> Verifique se a URL está correta</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleGoBack} variant="outline" className={`flex-1 ${themeClasses.buttonOutline}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => window.location.reload()} className={`flex-1 ${themeClasses.button}`}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { store, products, allProducts, categories, meta } = catalogData;
  const gridLayout = store.product_grid_layout || 'default';
  
  // Products already come filtered from the API based on show_all_products_in_feed setting:
  // - If show_all_products_in_feed = true: products contains ALL products
  // - If show_all_products_in_feed = false: products contains only products WITHOUT category
  // allProducts always contains ALL products for category page navigation

  // Função para renderizar o produto baseado no layout
  const renderProduct = (product: Product, index: number) => {
    const baseClasses = "cursor-pointer group animate-fade-in relative";
    const animationStyle = { animationDelay: `${index * 50}ms` };
    const layout = store.catalog_layout || 'bottom';

    const longPressProps = useLongPress({
      onLongPress: () => handleProductLongPress(product),
      onClick: () => handleProductClick(product),
      delay: 500
    });

    if (gridLayout === 'instagram') {
      // Layout Instagram - sem gap nem bordas, apenas as imagens
      return (
        <div 
          key={product.id} 
          {...longPressProps}
          className={`${baseClasses} aspect-square overflow-hidden`}
          style={animationStyle}
        >
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center p-2">Sem imagem</span>
            </div>
          )}
          
          {/* Overlay com informações apenas no hover para Instagram */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
              <h3 className="text-xs font-medium line-clamp-2 mb-1">{product.name}</h3>
              {(() => {
                const prices = getProductPrices(product);
                return (
                  <div className="flex items-center gap-1">
                    {prices.hasDiscount && (
                      <span className="text-xs line-through opacity-70">R$ {prices.formattedOriginalPrice}</span>
                    )}
                    <p className="text-xs font-bold">R$ {prices.formattedFinalPrice}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      );
    }

    if (gridLayout === 'round') {
      // Layout com imagens redondas e informações abaixo
      return (
        <div 
          key={product.id} 
          {...longPressProps}
          className={`${baseClasses} bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all`}
          style={animationStyle}
        >
          <div className="flex flex-col items-center">
            {/* Imagem redonda */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-2 ring-2 ring-gray-200 group-hover:ring-4 group-hover:ring-blue-200 transition-all">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Sem imagem</span>
                </div>
              )}
            </div>
            
            {/* Informações abaixo da imagem */}
            <div className="text-center">
              <h3 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
              {(() => {
                const prices = getProductPrices(product);
                return (
                  <div className="flex items-center justify-center gap-1">
                    {prices.hasDiscount && (
                      <span className="text-xs line-through text-gray-400">R$ {prices.formattedOriginalPrice}</span>
                    )}
                    <p className="text-xs font-bold text-green-600">R$ {prices.formattedFinalPrice}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      );
    }

    // Layout padrão (default) com animação de desconto
    const productWithAnimation = (
      <div 
        key={product.id} 
        {...longPressProps}
        className={`${baseClasses} aspect-square bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all`}
        style={animationStyle}
      >
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center p-2">Sem imagem</span>
          </div>
        )}
        
        {layout === 'overlay' ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
              <h3 className="text-xs font-medium line-clamp-2 mb-1">{product.name}</h3>
              {(() => {
                const prices = getProductPrices(product);
                return (
                  <div className="flex items-center gap-1">
                    {prices.hasDiscount && (
                      <span className="text-xs line-through opacity-70">R$ {prices.formattedOriginalPrice}</span>
                    )}
                    <p className="text-xs font-bold">R$ {prices.formattedFinalPrice}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          (() => {
            const textBgEnabled = (store as any).product_text_background_enabled ?? true;
            const textBgColor = (store as any).product_text_background_color || '#000000';
            const textBgOpacity = (store as any).product_text_background_opacity ?? 70;
            const bgColorWithOpacity = `${textBgColor}${Math.round((textBgOpacity / 100) * 255).toString(16).padStart(2, '0')}`;
            
            return (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <div 
                  className="absolute bottom-0 left-0 right-0 p-2"
                  style={textBgEnabled ? { backgroundColor: bgColorWithOpacity } : {}}
                >
                  <h3 className="text-xs font-medium line-clamp-2 mb-1 text-white">{product.name}</h3>
                  {(() => {
                    const prices = getProductPrices(product);
                    return (
                      <div className="flex items-center gap-1">
                        {prices.hasDiscount && (
                          <span className="text-xs line-through text-white/70">R$ {prices.formattedOriginalPrice}</span>
                        )}
                        <p className="text-white text-left font-semibold text-xs">
                          R$ {prices.formattedFinalPrice}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()
        )}
      </div>
    );

    // Aplicar animação de desconto se habilitada
    if (product.discount && product.discount > 0 && product.discount_animation_enabled) {
      return (
        <DiscountAnimation
          enabled={true}
          color={product.discount_animation_color || '#ff0000'}
          className="rounded-sm"
        >
          {productWithAnimation}
        </DiscountAnimation>
      );
    }

    return productWithAnimation;
  };

  return (
    <CatalogTheme 
      theme={theme} 
      backgroundColor={store.background_color}
      backgroundImage={store.background_image_url}
      backgroundType={store.background_type}
    >
      <div className={`max-w-md mx-auto lg:max-w-xl xl:max-w-2xl ${themeClasses.card} min-h-screen shadow-lg relative`}>
        
        {/* Header Profile Section */}
        <div className={`px-4 pt-8 pb-6 border-b ${themeClasses.header}`}>
          {/* Owner Controls */}
          {isOwner && (
            <div className="absolute top-4 right-4 z-10 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEditMode}
                className={`p-2 rounded-full transition-colors ${
                  isEditMode ? 'bg-blue-500 text-white' : 'hover:bg-black/10'
                }`}
                title={isEditMode ? "Sair do modo de edição" : "Entrar no modo de edição"}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
                disabled={!canAccessFeature(profile, 'customization')}
                title="Personalizar catálogo"
              >
                <icons.Settings className="h-4 w-4" />
              </Button>
              <ShareButton storeUrl={storeUrl || ''} storeName={catalogData?.store.store_name || ''} />
            </div>
          )}
          
          {/* Share button for non-owners */}
          {!isOwner && (
            <div className="absolute top-4 right-4 z-10">
              <ShareButton storeUrl={storeUrl || ''} storeName={catalogData?.store.store_name || ''} />
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-2 ring-gray-200 flex-shrink-0">
              {store.profile_photo_url ? (
                <img src={store.profile_photo_url} alt={store.store_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                  {store.store_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className={`text-xl font-semibold truncate ${themeClasses.text}`}>{store.store_name}</h1>
                 {store.is_verified && (
                  <div className="relative flex-shrink-0">
                    <img 
                      src="/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png" 
                      alt="Verificado" 
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className={`font-semibold ${themeClasses.text}`}>{meta.total_products}</div>
                  <div className={themeClasses.textMuted}>Produtos</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${themeClasses.text}`}>
                    {storeAnalytics?.total_catalog_views || 0}
                  </div>
                  <div className={themeClasses.textMuted}>Visualizações</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${themeClasses.text}`}>
                    {storeAnalytics?.total_whatsapp_clicks || 0}
                  </div>
                  <div className={themeClasses.textMuted}>Conversas</div>
                </div>
              </div>
            </div>
          </div>

          {store.store_description && <p className={`text-sm ${themeClasses.textMuted} mb-4 leading-relaxed`}>{store.store_description}</p>}

          {/* Action Buttons - Only show if configured */}
          {(isWhatsAppAvailable() || isInstagramAvailable()) && (
            <div className="flex gap-2">
              {isInstagramAvailable() && (
                <Button onClick={handleInstagramFollow} className={`flex-1 ${themeClasses.button} rounded-lg h-9 text-sm font-medium transition-colors`}>
                  <Instagram className="h-4 w-4 mr-2" />
                  Seguir
                </Button>
              )}
              {isWhatsAppAvailable() && (
                <Button variant="outline" className={`flex-1 ${themeClasses.buttonOutline} rounded-lg h-9 text-sm font-medium transition-colors`} onClick={handleWhatsAppContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Mensagem
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Category Stories Section - Instagram Style */}
        {categories && categories.length > 0 && (
          <div className={`px-4 py-3 border-b ${themeClasses.header}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-sm font-semibold ${themeClasses.text}`}>Categorias</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/catalog/${storeUrl}/categories`)}
                className={`text-xs ${themeClasses.textMuted} hover:${themeClasses.text}`}
              >
                Ver todas
              </Button>
            </div>
            
            {/* Horizontal scroll for categories */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.map((category, index) => (
                <div 
                  key={category.id}
                  onClick={() => navigate(`/catalog/${storeUrl}/category/${category.id}`)}
                  className="cursor-pointer flex-shrink-0 animate-fade-in group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col items-center gap-1 w-16">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-400 via-pink-400 to-red-400 p-0.5 group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-bold">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs ${themeClasses.text} truncate w-full text-center`}>
                      {category.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs Section - Similar to Instagram */}
        <div className={`border-b ${themeClasses.header}`}>
          {/* Tab Buttons */}
          <div className="flex justify-center gap-8 py-3">
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex flex-col items-center cursor-pointer transition-colors ${
                activeTab === 'products' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
            >
              <Grid3X3 className={`h-6 w-6 ${themeClasses.textMuted}`} />
              {activeTab === 'products' && (
                <div className={`w-6 h-0.5 bg-current mt-1 ${themeClasses.textMuted}`}></div>
              )}
            </button>
            
            {catalogData.customLinks && catalogData.customLinks.length > 0 && (
              <button 
                onClick={() => setActiveTab('links')}
                className={`flex flex-col items-center cursor-pointer transition-colors ${
                  activeTab === 'links' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                }`}
              >
                <Link2 className={`h-6 w-6 ${themeClasses.textMuted}`} />
                {activeTab === 'links' && (
                  <div className={`w-6 h-0.5 bg-current mt-1 ${themeClasses.textMuted}`}></div>
                )}
              </button>
            )}
            
            {categories && categories.length > 0 && (
            <button 
              onClick={() => setActiveTab('categories')}
              className={`flex flex-col items-center cursor-pointer transition-colors ${
                activeTab === 'categories' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
            >
              <icons.List className={`h-6 w-6 ${themeClasses.textMuted}`} />
              {activeTab === 'categories' && (
                <div className={`w-6 h-0.5 bg-current mt-1 ${themeClasses.textMuted}`}></div>
              )}
            </button>
            )}
          </div>
        </div>

        {/* Products Container */}
        {activeTab === 'products' && (
          <div 
            className={`p-1 animate-fade-in`}
            style={{
              backgroundColor: store.custom_background_enabled && store.background_type === 'color' ? store.background_color : undefined,
              backgroundImage: store.custom_background_enabled && store.background_type === 'image' && store.background_image_url ? `url(${store.background_image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {products.length > 0 ? (
              <DragDropProductGrid
                products={products}
                onReorder={handleProductReorder}
                isEditMode={isEditMode}
                gridLayout={gridLayout}
                themeClasses={themeClasses}
                storeUrl={storeUrl || ''}
                renderProduct={renderProduct}
              />
            ) : (
              <div className={`text-center py-16 ${themeClasses.card} rounded-lg mx-2 bg-white/90 backdrop-blur-sm`}>
                <div className={`w-16 h-16 ${themeClasses.accent} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <icons.List className={`h-8 w-8 ${themeClasses.textMuted}`} />
                </div>
                <h3 className={`font-medium ${themeClasses.text} mb-2`}>Nenhum produto ainda</h3>
                <p className={`text-sm ${themeClasses.textMuted}`}>Esta loja ainda não adicionou produtos ao catálogo.</p>
              </div>
            )}
          </div>
        )}

        {/* Custom Links Container */}
        {activeTab === 'links' && catalogData.customLinks && catalogData.customLinks.length > 0 && (
          <div 
            className={`p-4 animate-fade-in`}
            style={{
              backgroundColor: store.custom_background_enabled && store.background_type === 'color' ? store.background_color : undefined,
              backgroundImage: store.custom_background_enabled && store.background_type === 'image' && store.background_image_url ? `url(${store.background_image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="flex flex-col gap-3">
              {catalogData.customLinks.map((link, index) => {
                const IconComponent = (icons as any)[link.icon || 'ExternalLink'] || ExternalLink;
                
                return (
                  <div
                    key={link.id}
                    onClick={() => handleCustomLinkClick(link)}
                    className={`${themeClasses.card} rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100 group animate-fade-in`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${themeClasses.accent} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <IconComponent className={`h-6 w-6 ${themeClasses.textMuted}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${themeClasses.text} truncate`}>{link.title}</h3>
                        <p className={`text-sm ${themeClasses.textMuted} truncate`}>Clique para acessar</p>
                      </div>
                      <ExternalLink className={`h-5 w-5 ${themeClasses.textMuted} opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories Container */}
        {activeTab === 'categories' && (
          <div 
            className={`p-4 animate-fade-in`}
            style={{
              backgroundColor: store.custom_background_enabled && store.background_type === 'color' ? store.background_color : undefined,
              backgroundImage: store.custom_background_enabled && store.background_type === 'image' && store.background_image_url ? `url(${store.background_image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Products Section First - Instagram Style */}
            {allProducts && allProducts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${themeClasses.text}`}>Produtos</h2>
                  <span className={`text-sm ${themeClasses.textMuted}`}>
                    {allProducts.length} produtos
                  </span>
                </div>
                
                {/* Instagram Style Product Grid */}
                <InstagramStyleProductGrid
                  products={allProducts}
                  onBuyNow={handleBuyNow}
                  themeClasses={themeClasses}
                />
              </div>
            )}
            
            {/* Categories Section with Drag and Drop */}
            {categories && categories.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${themeClasses.text}`}>Categorias</h2>
                  {isEditMode && (
                    <span className={`text-xs ${themeClasses.textMuted} bg-blue-100 px-2 py-1 rounded`}>
                      Modo de edição: arraste para reordenar
                    </span>
                  )}
                </div>
                
                <DragDropCategoryGrid
                  categories={categories}
                  onReorder={handleCategoryReorder}
                  isEditMode={isEditMode}
                  themeClasses={themeClasses}
                  storeUrl={storeUrl || ''}
                />
              </div>
            )}
            
            {/* Fallback button if no categories */}
            {(!categories || categories.length === 0) && (
              <div className="text-center py-8">
                <Button 
                  onClick={() => navigate(`/catalog/${storeUrl}/categories`)}
                  className={`${themeClasses.button} rounded-full px-8 py-3 text-sm font-medium hover:scale-105 transition-all shadow-lg`}
                >
                  <icons.List className="h-4 w-4 mr-2" />
                  Ver Todas as Categorias
                </Button>
                <p className={`text-sm ${themeClasses.textMuted} mt-3`}>
                  Explore produtos organizados por categoria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty Links State */}
        {activeTab === 'links' && (!catalogData.customLinks || catalogData.customLinks.length === 0) && (
          <div 
            className={`p-4 animate-fade-in`}
            style={{
              backgroundColor: store.custom_background_enabled && store.background_type === 'color' ? store.background_color : undefined,
              backgroundImage: store.custom_background_enabled && store.background_type === 'image' && store.background_image_url ? `url(${store.background_image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className={`text-center py-16 ${themeClasses.card} rounded-lg bg-white/90 backdrop-blur-sm`}>
              <div className={`w-16 h-16 ${themeClasses.accent} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Link2 className={`h-8 w-8 ${themeClasses.textMuted}`} />
              </div>
              <h3 className={`font-medium ${themeClasses.text} mb-2`}>Nenhum link ainda</h3>
              <p className={`text-sm ${themeClasses.textMuted}`}>Esta loja ainda não adicionou links personalizados.</p>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        {profile && (
          <CatalogEditDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            profile={profile}
            onUpdateProfile={updateProfile}
            canAccessFeature={canAccessFeature}
          />
        )}

        {/* Footer */}
        {!store.hide_footer && (
          <div className={`py-6 ${themeClasses.accent}`}>            
            <div className={`text-center text-xs ${themeClasses.textMuted}`}>
              <p className="text-xs">Criado com 💚 no <a href="https://www.mylinkbuy.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">MyLinkBuy</a></p>
              <p className="mt-1 text-xs font-thin">Última atualização: {new Date(catalogData.meta.generated_at).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        )}

        {/* Product Preview Modal */}
        <ProductPreviewModal
          product={previewProduct}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onBuyNow={handleBuyNow}
          themeClasses={themeClasses}
        />
      </div>
    </CatalogTheme>
  );
}; // End of Catalog component

// Exportar componente Catalog
export default Catalog;