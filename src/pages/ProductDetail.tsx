
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - em produção viria de uma API
const mockProduct = {
  id: 1,
  name: "Tênis Esportivo Premium",
  price: 299.90,
  description: "Tênis de alta qualidade, perfeito para atividades físicas e uso casual. Fabricado com materiais premium que garantem conforto e durabilidade. Disponível em várias cores e tamanhos.",
  images: [
    "/api/placeholder/400/400",
    "/api/placeholder/400/400", 
    "/api/placeholder/400/400"
  ]
};

const ProductDetail = () => {
  const { storeSlug, productId } = useParams();
  const navigate = useNavigate();
  const [product] = useState(mockProduct);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name} - R$ ${product.price.toFixed(2).replace('.', ',')}`);
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/c/${storeSlug}`)}
            className="rounded-full hover:bg-accent hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Image Carousel */}
        <div className="relative rounded-xl mx-4 mt-4 overflow-hidden shadow-lg">
          <div className="aspect-square bg-muted overflow-hidden">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>
          
          {product.images.length > 1 && (
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
            <p className="text-3xl font-bold text-whatsapp">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h2 className="font-semibold mb-3 text-lg">Descrição</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* WhatsApp Button */}
          <div className="pt-2">
            <Button 
              className="whatsapp-btn w-full text-lg py-6 rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
