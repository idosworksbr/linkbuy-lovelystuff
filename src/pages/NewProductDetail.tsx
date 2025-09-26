import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductDetail } from "@/hooks/useProductDetail";
import { CatalogTheme, useThemeClasses } from "@/components/CatalogTheme";
import { useState, useEffect } from "react";
import { useAnalyticsTracker } from "@/hooks/useAnalytics";
import { getProductPrices } from "@/lib/priceUtils";

const NewProductDetail = () => {
  const { storeUrl, productId } = useParams();
  const navigate = useNavigate();
  const { trackEvent } = useAnalyticsTracker();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { product, loading, error } = useProductDetail(storeUrl || '', productId || '');
  
  const theme = product?.store.catalog_theme || 'light';
  const themeClasses = useThemeClasses(theme);

  // Função robusta para verificar se o WhatsApp está disponível
  const isWhatsAppAvailable = () => {
    const whatsappNumber = product?.store.whatsapp_number;
    
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

  const handleWhatsAppOrder = () => {
    if (!product?.store) return;
    
    if (!isWhatsAppAvailable()) {
      console.error('Número do WhatsApp não disponível');
      return;
    }

    // Track WhatsApp click
    trackEvent('whatsapp_click', product.store.id, product.id);

    const customMessage = product.store.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.';
    const prices = getProductPrices(product);
    const productMessage = `${customMessage}\n\nProduto: ${product.name} - R$ ${prices.formattedFinalPrice}`;
    const message = encodeURIComponent(productMessage);
    
    // Smart WhatsApp URL generation - check if number already includes country code
    const phoneStr = product.store.whatsapp_number.toString();
    const cleanPhone = phoneStr.startsWith('55') ? phoneStr : `55${phoneStr}`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    
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

  // Track product view when component mounts
  useEffect(() => {
    if (product?.store?.id && productId) {
      trackEvent('product_view', product.store.id, productId);
    }
  }, [product, productId, trackEvent]);

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.container} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      <div className="max-w-md mx-auto lg:max-w-xl xl:max-w-2xl relative min-h-screen">
        
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
          
          <Button 
            variant="ghost" 
            size="sm"
            className={`rounded-full hover:bg-accent hover:scale-105 transition-all duration-200 ${themeClasses.buttonOutline}`}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Polaroid-style Product Card */}
        <div className="p-6 flex justify-center">
          <div className="bg-white rounded-lg shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 max-w-sm w-full animate-fade-in border-8 border-white">
            
            {/* Image Section */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}
              
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 rounded-full p-2 hover:bg-white hover:scale-110 transition-all duration-200 shadow-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 rounded-full p-2 hover:bg-white hover:scale-110 transition-all duration-200 shadow-md"
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
                            ? 'bg-gray-800 shadow-lg' 
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Polaroid Bottom Section */}
            <div className="p-4 bg-white">
              {/* Product Name - Handwritten style */}
              <h1 className="text-xl font-bold text-gray-800 mb-2 text-center" 
                  style={{ fontFamily: 'Caveat, cursive' }}>
                {product.name}
              </h1>
              
              {/* Price Tag */}
              <div className="text-center mb-4">
                {(() => {
                  const prices = getProductPrices(product);
                  return (
                    <div className="flex flex-col items-center gap-2">
                      {prices.hasDiscount && (
                        <span className="text-sm text-gray-500 line-through transform rotate-1">
                          R$ {prices.formattedOriginalPrice}
                        </span>
                      )}
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg transform -rotate-2 inline-block">
                        R$ {prices.formattedFinalPrice}
                        {prices.hasDiscount && (
                          <span className="ml-2 text-xs bg-red-500 px-2 py-1 rounded-full">
                            -{prices.discountPercentage}%
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })()}
              </div>
              
              {/* Small description if available */}
              {product.description && (
                <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2" 
                   style={{ fontFamily: 'Caveat, cursive' }}>
                  {product.description}
                </p>
              )}
              
              {/* WhatsApp Button - Polaroid style - Only show if available */}
              {isWhatsAppAvailable() && (
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={handleWhatsAppOrder}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Pedir pelo WhatsApp
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Store Attribution */}
        <div className="p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Foto tirada na loja
          </p>
          <p className={`text-sm font-semibold ${themeClasses.text}`}>
            📷 {product.store.store_name}
          </p>
        </div>

        {/* Conditional Footer */}
        {!product.store.hide_footer && (
          <div className={`text-center py-6 text-xs ${themeClasses.textMuted} border-t rounded-t-xl mx-4`} 
               style={{ backgroundColor: theme === 'light' ? '#f8f9fa' : theme === 'dark' ? '#374151' : '#fef3c7' }}>
            Criado com 💚 no <a href="https://mylinkbuy.com" target="_blank" rel="noopener noreferrer" className="hover:underline">MyLinkBuy</a>
          </div>
        )}
      </div>
    </CatalogTheme>
  );
};

export default NewProductDetail;