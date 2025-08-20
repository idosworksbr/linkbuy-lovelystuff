import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, Grid3X3, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StoreProfile {
  id: string;
  store_name: string;
  store_description: string | null;
  profile_photo_url: string | null;
  background_color: string;
  store_url: string;
  whatsapp_number: string | null;
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

  useEffect(() => {
    const fetchCatalogData = async () => {
      if (!storeUrl) {
        console.log('❌ storeUrl missing:', storeUrl);
        setError('URL da loja não foi fornecida');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching catalog for:', storeUrl);
        
        const functionUrl = `https://rpkawimruhfqhxbpavce.supabase.co/functions/v1/catalog/${storeUrl}`;
        console.log('🌐 Function URL:', functionUrl);
        
        const response = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('❌ Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data: CatalogData = await response.json();
        console.log('✅ Data parsed successfully:', {
          store_name: data.store?.store_name,
          product_count: data.products?.length || 0
        });
        
        setCatalogData(data);
        
        toast({
          title: "Catálogo carregado!",
          description: `${data.meta.total_products} produtos encontrados`,
        });
        
      } catch (error) {
        console.error('💥 Fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar catálogo';
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
    
    const phoneNumber = catalogData.store.whatsapp_number || '5511999999999';
    const message = encodeURIComponent(
      `Olá! Vim pelo seu catálogo LinkBuy "${catalogData.store.store_name}" e gostaria de saber mais sobre seus produtos.`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleProductClick = (product: Product) => {
    navigate(`/catalog/${storeUrl}/product/${product.id}`);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium mb-2">Carregando catálogo...</p>
          <p className="text-sm text-gray-500">Loja: <span className="font-mono font-semibold">{storeUrl}</span></p>
        </div>
      </div>
    );
  }

  if (error || !catalogData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="h-8 w-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Loja não encontrada</h1>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            {error || "A loja que você está procurando não existe ou foi removida."}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-2">Detalhes:</p>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">URL:</span> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{storeUrl}</span></p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { store, products, meta } = catalogData;

  return (
    <div className="min-h-screen" style={{ backgroundColor: store.background_color }}>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="px-4 pt-8 pb-6 border-b border-gray-100">
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
              <h1 className="text-xl font-semibold mb-2 truncate">{store.store_name}</h1>
              
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{meta.total_products}</div>
                  <div className="text-gray-500">Produtos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">1.2k</div>
                  <div className="text-gray-500">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">180</div>
                  <div className="text-gray-500">Seguindo</div>
                </div>
              </div>
            </div>
          </div>

          {store.store_description && (
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">{store.store_description}</p>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleWhatsAppContact}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9 text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Seguir
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-gray-300 text-gray-700 rounded-lg h-9 text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={handleWhatsAppContact}
            >
              Mensagem
            </Button>
          </div>
        </div>

        <div className="flex justify-center py-3 bg-gray-50">
          <Grid3X3 className="h-6 w-6 text-gray-400" />
        </div>

        <div className="p-1 bg-gray-50">
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
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h3 className="text-xs font-semibold text-white drop-shadow-lg line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs font-bold text-green-400 drop-shadow-lg">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg mx-2">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Nenhum produto ainda</h3>
              <p className="text-sm text-gray-500">Esta loja ainda não adicionou produtos ao catálogo.</p>
            </div>
          )}
        </div>

        <div className="text-center py-6 text-xs text-gray-400 bg-gray-50">
          <p>Criado com 💚 no <span className="font-semibold">LinkBuy</span></p>
          <p className="mt-1">Última atualização: {new Date(meta.generated_at).toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
