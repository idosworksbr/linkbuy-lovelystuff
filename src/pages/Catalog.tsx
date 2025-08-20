
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface StoreProfile {
  id: string;
  name: string;
  store_name: string;
  store_description: string | null;
  profile_photo_url: string | null;
  background_color: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
}

const Catalog = () => {
  const { storeUrl } = useParams();
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogData = async () => {
      if (!storeUrl) return;

      try {
        setLoading(true);
        
        // Buscar dados usando a Edge Function
        const response = await fetch(`https://rpkawimruhfqhxbpavce.supabase.co/functions/v1/catalog/${storeUrl}`);
        
        if (!response.ok) {
          throw new Error('Loja não encontrada');
        }

        const data = await response.json();
        setStore(data.store);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching catalog:', error);
        setError('Não foi possível carregar o catálogo');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [storeUrl]);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Olá! Vim pelo seu catálogo LinkBuy e gostaria de saber mais sobre seus produtos.`);
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const handleProductClick = (product: Product) => {
    window.location.href = `/catalog/${storeUrl}/${product.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loja não encontrada</h1>
          <p className="text-gray-600">A loja que você está procurando não existe ou foi removida.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: store.background_color }}>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header Profile Section */}
        <div className="px-4 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-2 ring-gray-200">
              {store.profile_photo_url ? (
                <img src={store.profile_photo_url} alt={store.store_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                  {store.store_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl font-semibold mb-1">{store.store_name}</h1>
              
              {/* Stats Row */}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{products.length}</div>
                  <div className="text-gray-500">Produtos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">1.2k</div>
                  <div className="text-gray-500">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">180</div>
                  <div className="text-gray-500">Seguindo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {store.store_description && (
            <p className="text-sm text-gray-700 mb-4">{store.store_description}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleWhatsAppContact}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-8 text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Seguir
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-gray-300 text-gray-700 rounded-lg h-8 text-sm font-medium hover:bg-gray-50"
            >
              Mensagem
            </Button>
          </div>
        </div>

        {/* Grid Icon */}
        <div className="border-t border-gray-200">
          <div className="flex justify-center py-3">
            <Grid3X3 className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="px-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  onClick={() => handleProductClick(product)} 
                  className="relative aspect-square cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sem imagem</span>
                    </div>
                  )}
                  
                  {/* Gradient overlay with product info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                      <h3 className="text-xs font-medium line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs font-bold">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum produto disponível</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-muted-foreground">
          Criado com 💚 no LinkBuy
        </div>
      </div>
    </div>
  );
};

export default Catalog;
