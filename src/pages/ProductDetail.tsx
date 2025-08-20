
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/c/${storeSlug}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Image Carousel */}
        <div className="relative">
          <div className="aspect-square bg-muted overflow-hidden">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-whatsapp">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Descrição</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* WhatsApp Button */}
          <div className="pt-4">
            <Button 
              className="whatsapp-btn w-full text-lg py-4"
              onClick={handleWhatsAppOrder}
            >
              <MessageCircle className="h-6 w-6" />
              Fazer Pedido pelo WhatsApp
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-muted-foreground border-t">
          Criado com 💚 no LinkBuy
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
