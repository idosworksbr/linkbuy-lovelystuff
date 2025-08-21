import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductDetail } from "@/hooks/useProductDetail";
import { CatalogTheme, useThemeClasses } from "@/components/CatalogTheme";
import { useState } from "react";

const ProductDetail = () => {
  const { storeUrl, productId } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { product, loading, error } = useProductDetail(storeUrl || '', productId || '');
  
  const theme = product?.store.catalog_theme || 'light';
  const themeClasses = useThemeClasses(theme);

  const handleWhatsAppOrder = () => {
    console.log('WhatsApp dados:', {
      whatsapp_number: product?.store.whatsapp_number,
      type: typeof product?.store.whatsapp_number
    });

    if (!product?.store.whatsapp_number) {
      console.error('Número do WhatsApp não disponível');
      return;
    }

    const customMessage = product.store.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.';
    const productMessage = `${customMessage}\n\nProduto: ${product.name} - R$ ${product.price.toFixed(2).replace('.', ',')}`;
    const message = encodeURIComponent(productMessage);
    const whatsappUrl = `https://wa.me/55${product.store.whatsapp_number}?text=${message}`;
    
    console.log('Abrindo WhatsApp:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  const nextImage = () => {
    if (!product?.images.length) return;
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!product?.images.length) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.container} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={themeClasses.textMuted}>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen ${themeClasses.container} flex items-center justify-center`}>
        <div className="text-center p-6">
          <p className="text-red-500 mb-4">Produto não encontrado</p>
          <Button onClick={() => navigate(`/catalog/${storeUrl}`)}>
            Voltar ao catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CatalogTheme theme={theme} backgroundColor={product.store.background_color}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${themeClasses.header}`}>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/catalog/${storeUrl}`)}
            className={`rounded-full hover:bg-accent hover:scale-105 transition-all duration-200 ${themeClasses.buttonOutline}`}
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
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">Sem imagem</span>
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
          <div className={`${themeClasses.card} rounded-xl p-4 shadow-sm border`}>
            <h1 className={`text-2xl font-bold mb-3 ${themeClasses.text}`}>{product.name}</h1>
            <p className="text-3xl font-bold text-green-600">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {product.description && (
            <div className={`${themeClasses.card} rounded-xl p-4 shadow-sm border`}>
              <h2 className={`font-semibold mb-3 text-lg ${themeClasses.text}`}>Descrição</h2>
              <p className={`${themeClasses.textMuted} leading-relaxed`}>
                {product.description}
              </p>
            </div>
          )}

          {/* WhatsApp Button */}
          <div className="pt-2">
            <Button 
              className="whatsapp-btn w-full text-lg py-6 rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={handleWhatsAppOrder}
              disabled={!product.store.whatsapp_number}
            >
              <MessageCircle className="h-6 w-6 mr-2" />
              {product.store.whatsapp_number ? 'Fazer Pedido pelo WhatsApp' : 'WhatsApp não disponível'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center py-6 text-xs ${themeClasses.textMuted} border-t rounded-t-xl mx-4`} 
             style={{ backgroundColor: theme === 'light' ? '#f8f9fa' : theme === 'dark' ? '#374151' : '#fef3c7' }}>
          Criado com 💚 no LinkBuy
        </div>
      </div>
    </CatalogTheme>
  );
};

export default ProductDetail;
