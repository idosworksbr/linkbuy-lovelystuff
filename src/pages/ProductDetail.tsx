
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  created_at: string;
}

interface StoreProfile {
  id: string;
  store_name: string;
  store_description: string | null;
  profile_photo_url: string | null;
  background_color: string;
  store_url: string;
  whatsapp_number: string | null;
}

interface CatalogData {
  store: StoreProfile;
  products: Product[];
}

const ProductDetail = () => {
  const { storeUrl, productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!storeUrl || !productId) {
        setError('Parâmetros inválidos');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Buscando produto:', { storeUrl, productId });
        
        // Buscar dados do catálogo
        const response = await fetch(
          `https://rpkawimruhfqhxbpavce.supabase.co/functions/v1/catalog/${storeUrl}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Loja não encontrada');
        }

        const catalogData: CatalogData = await response.json();
        console.log('✅ Dados do catálogo:', catalogData);
        
        // Encontrar o produto específico
        const foundProduct = catalogData.products.find(p => p.id === productId);
        
        if (!foundProduct) {
          throw new Error('Produto não encontrado');
        }

        setProduct(foundProduct);
        setStore(catalogData.store);
        
      } catch (error) {
        console.error('💥 Erro ao carregar produto:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar produto';
        setError(errorMessage);
        
        toast({
          title: "Erro ao carregar produto",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [storeUrl, productId, toast]);

  const handleWhatsAppOrder = () => {
    if (!product || !store) return;
    
    // Usar o número configurado pelo usuário ou um número padrão
    const phoneNumber = store.whatsapp_number || '5511999999999';
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${product.name} - R$ ${product.price.toFixed(2).replace('.', ',')}`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleGoBack = () => {
    // Navegar de volta para o catálogo da loja
    navigate(`/catalog/${storeUrl}`);
  };

  const nextImage = () => {
    if (!product || !product.images.length) return;
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!product || !product.images.length) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium mb-2">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">{error || "O produto que você está procurando não existe."}</p>
          <Button onClick={handleGoBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleGoBack}
            className="rounded-full hover:bg-accent hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Image Carousel */}
        <div className="relative rounded-xl mx-4 mt-4 overflow-hidden shadow-lg">
          <div className="aspect-square bg-muted overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                Sem imagem
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 hover:scale-110 transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 hover:scale-110 transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 hover:scale-125 ${
                      index === currentImageIndex 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h1 className="text-2xl font-bold mb-3">{product.name}</h1>
            <p className="text-3xl font-bold text-green-700">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {product.description && (
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h2 className="font-semibold mb-3 text-lg">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* WhatsApp Button */}
          <div className="pt-2">
            <Button 
              className="whatsapp-btn w-full text-lg py-6 rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl bg-green-600 hover:bg-green-700"
              onClick={handleWhatsAppOrder}
            >
              <MessageCircle className="h-6 w-6" />
              Fazer Pedido pelo WhatsApp
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-muted-foreground border-t bg-gray-50/50 rounded-t-xl mx-4">
          Criado com 💚 no LinkBuy
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
