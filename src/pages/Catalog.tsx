import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, Grid3X3, ArrowLeft, ExternalLink, Instagram, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CatalogTheme, useThemeClasses } from "@/components/CatalogTheme";

interface StoreProfile {
  id: string;
  store_name: string;
  store_description: string | null;
  profile_photo_url: string | null;
  background_color: string;
  store_url: string;
  whatsapp_number: number | null;
  custom_whatsapp_message: string;
  instagram_url: string | null;
  catalog_theme: 'light' | 'dark' | 'beige';
  catalog_layout: 'overlay' | 'bottom';
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  created_at: string;
}

interface CatalogData {
  store: StoreProfile;
  products: Product[];
  meta: {
    total_products: number;
    generated_at: string;
  };
}

const Catalog = () => {
  const { storeUrl } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const theme = catalogData?.store.catalog_theme || 'light';
  const layout = catalogData?.store.catalog_layout || 'overlay';
  const themeClasses = useThemeClasses(theme);

  // Função robusta para verificar se o WhatsApp está disponível
  const isWhatsAppAvailable = () => {
    const whatsappNumber = catalogData?.store.whatsapp_number;
    
    console.group('🔍 WhatsApp Debug - Catalog');
    console.log('Raw whatsapp_number:', whatsappNumber);
    console.log('Type:', typeof whatsappNumber);
    console.log('Is null:', whatsappNumber === null);
    console.log('Is undefined:', whatsappNumber === undefined);
    console.log('String value:', String(whatsappNumber));
    console.log('Number conversion:', Number(whatsappNumber));
    console.log('Is NaN:', isNaN(Number(whatsappNumber)));
    console.groupEnd();

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
    
    console.group('🔍 Instagram Debug - Catalog');
    console.log('Raw instagram_url:', instagramUrl);
    console.log('Type:', typeof instagramUrl);
    console.log('Is null:', instagramUrl === null);
    console.log('Is undefined:', instagramUrl === undefined);
    console.log('Is empty string:', instagramUrl === '');
    console.log('Trimmed value:', instagramUrl?.trim());
    console.groupEnd();

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
        
        console.log('🔍 Buscando catálogo para:', storeUrl);
        
        const response = await fetch(
          `https://rpkawimruhfqhxbpavce.supabase.co/functions/v1/catalog/${storeUrl}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            error: 'Erro na resposta do servidor',
            message: 'Não foi possível carregar o catálogo'
          }));
          console.log('❌ Erro da API:', errorData);
          throw new Error(errorData.message || errorData.error || 'Loja não encontrada');
        }

        const data: CatalogData = await response.json();
        console.log('✅ Dados recebidos:', data);
        console.log('📞 WhatsApp number no response:', data.store.whatsapp_number, typeof data.store.whatsapp_number);
        
        setCatalogData(data);
        
        toast({
          title: "Catálogo carregado!",
          description: `${data.meta.total_products} produtos encontrados`,
        });
        
      } catch (error) {
        console.error('💥 Error fetching catalog:', error);
        const errorMessage = error instanceof Error ? error.message : 'Não foi possível carregar o catálogo';
        setError(errorMessage);
        
        toast({
          title: "Erro ao carregar catálogo",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [storeUrl, toast]);

  const handleWhatsAppContact = () => {
    if (!catalogData?.store) return;
    
    if (!isWhatsAppAvailable()) {
      console.error('WhatsApp não está disponível');
      toast({
        title: "WhatsApp não disponível",
        description: "Esta loja não configurou um número de WhatsApp válido.",
        variant: "destructive",
      });
      return;
    }

    const phoneNumber = catalogData.store.whatsapp_number;
    const message = encodeURIComponent(catalogData.store.custom_whatsapp_message || 'Olá! Vi seu catálogo LinkBuy e gostaria de saber mais sobre seus produtos.');
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${message}`;
    
    console.log('📞 Abrindo WhatsApp:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  const handleInstagramFollow = () => {
    if (!catalogData?.store) return;

    if (!isInstagramAvailable()) {
      console.error('Instagram não está disponível');
      toast({
        title: "Instagram não disponível",
        description: "Esta loja não configurou um perfil do Instagram válido.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('📷 Abrindo Instagram:', catalogData.store.instagram_url);
    window.open(catalogData.store.instagram_url, '_blank');
  };

  const handleProductClick = (product: Product) => {
    navigate(`/catalog/${storeUrl}/product/${product.id}`);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  // Debug component
  const DebugInfo = () => {
    if (!showDebug || !catalogData) return null;

    return (
      <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg z-50 max-w-md text-xs">
        <h3 className="font-bold mb-2">🐛 Debug Info</h3>
        <div className="space-y-2">
          <div>
            <strong>WhatsApp Number:</strong> {JSON.stringify(catalogData.store.whatsapp_number)}
          </div>
          <div>
            <strong>WhatsApp Type:</strong> {typeof catalogData.store.whatsapp_number}
          </div>
          <div>
            <strong>WhatsApp Available:</strong> {isWhatsAppAvailable() ? '✅' : '❌'}
          </div>
          <div>
            <strong>Instagram URL:</strong> {JSON.stringify(catalogData.store.instagram_url)}
          </div>
          <div>
            <strong>Instagram Available:</strong> {isInstagramAvailable() ? '✅' : '❌'}
          </div>
          <div>
            <strong>Theme:</strong> {catalogData.store.catalog_theme}
          </div>
          <div>
            <strong>Layout:</strong> {catalogData.store.catalog_layout}
          </div>
        </div>
        <button 
          onClick={() => setShowDebug(false)}
          className="mt-2 bg-red-500 px-2 py-1 rounded text-xs"
        >
          Fechar
        </button>
      </div>
    );
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
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className={`flex-1 ${themeClasses.buttonOutline}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className={`flex-1 ${themeClasses.button}`}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { store, products, meta } = catalogData;

  console.table({
    'Store Name': store.store_name,
    'WhatsApp Number': store.whatsapp_number,
    'WhatsApp Type': typeof store.whatsapp_number,
    'WhatsApp Available': isWhatsAppAvailable(),
    'Instagram URL': store.instagram_url,
    'Instagram Available': isInstagramAvailable(),
    'Theme': store.catalog_theme,
    'Layout': store.catalog_layout
  });

  return (
    <CatalogTheme theme={theme} backgroundColor={store.background_color}>
      <div className={`max-w-md mx-auto ${themeClasses.card} min-h-screen shadow-lg relative`}>
        
        {/* Debug Button */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="fixed top-4 left-4 bg-red-500 text-white p-2 rounded-full z-40 shadow-lg hover:bg-red-600"
          title="Debug Info"
        >
          <Bug className="h-4 w-4" />
        </button>

        <DebugInfo />

        {/* Header Profile Section */}
        <div className={`px-4 pt-8 pb-6 border-b ${themeClasses.header}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-2 ring-gray-200 flex-shrink-0">
              {store.profile_photo_url ? (
                <img 
                  src={store.profile_photo_url} 
                  alt={store.store_name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                  {store.store_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className={`text-xl font-semibold mb-2 truncate ${themeClasses.text}`}>{store.store_name}</h1>
              
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className={`font-semibold ${themeClasses.text}`}>{meta.total_products}</div>
                  <div className={themeClasses.textMuted}>Produtos</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${themeClasses.text}`}>1.2k</div>
                  <div className={themeClasses.textMuted}>Seguidores</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${themeClasses.text}`}>180</div>
                  <div className={themeClasses.textMuted}>Seguindo</div>
                </div>
              </div>
            </div>
          </div>

          {store.store_description && (
            <p className={`text-sm ${themeClasses.textMuted} mb-4 leading-relaxed`}>{store.store_description}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleInstagramFollow}
              className={`flex-1 ${themeClasses.button} rounded-lg h-9 text-sm font-medium transition-colors`}
              disabled={!isInstagramAvailable()}
            >
              <Instagram className="h-4 w-4 mr-2" />
              {isInstagramAvailable() ? 'Seguir' : 'Instagram indisponível'}
            </Button>
            <Button 
              variant="outline" 
              className={`flex-1 ${themeClasses.buttonOutline} rounded-lg h-9 text-sm font-medium transition-colors`}
              onClick={handleWhatsAppContact}
              disabled={!isWhatsAppAvailable()}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {isWhatsAppAvailable() ? 'Mensagem' : 'WhatsApp indisponível'}
            </Button>
          </div>
        </div>

        {/* Grid Icon */}
        <div className={`flex justify-center py-3 ${theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-gray-800' : 'bg-amber-100'}`}>
          <Grid3X3 className={`h-6 w-6 ${themeClasses.textMuted}`} />
        </div>

        {/* Products Grid */}
        <div className={`p-1 ${theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-gray-800' : 'bg-amber-100'}`}>
          {products.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  onClick={() => handleProductClick(product)} 
                  className="relative aspect-square cursor-pointer group animate-fade-in bg-white rounded-sm overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                        <h3 className="text-xs font-medium line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs font-bold">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <h3 className="text-xs font-medium line-clamp-2 mb-1 text-black drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
                          {product.name}
                        </h3>
                        <p className="text-xs font-bold text-green-800 drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-16 ${themeClasses.card} rounded-lg mx-2`}>
              <div className={`w-16 h-16 ${theme === 'light' ? 'bg-gray-100' : theme === 'dark' ? 'bg-gray-700' : 'bg-amber-200'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Grid3X3 className={`h-8 w-8 ${themeClasses.textMuted}`} />
              </div>
              <h3 className={`font-medium ${themeClasses.text} mb-2`}>Nenhum produto ainda</h3>
              <p className={`text-sm ${themeClasses.textMuted}`}>Esta loja ainda não adicionou produtos ao catálogo.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`text-center py-6 text-xs ${themeClasses.textMuted} ${theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-gray-800' : 'bg-amber-100'}`}>
          <p>Criado com 💚 no <span className="font-semibold">LinkBuy</span></p>
          <p className="mt-1">Última atualização: {new Date(meta.generated_at).toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </CatalogTheme>
  );
};

export default Catalog;
