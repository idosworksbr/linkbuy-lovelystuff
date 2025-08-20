
import { useState } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - em produção viria de uma API baseada no storeSlug
const mockStore = {
  name: "Minha Loja Fashion",
  description: "Roupas e acessórios com estilo único",
  logo: "/api/placeholder/150/150",
  backgroundColor: "#f8fafc",
  products: [{
    id: 1,
    name: "Tênis Esportivo Premium",
    price: 299.90,
    image: "/api/placeholder/300/300"
  }, {
    id: 2,
    name: "Camiseta Básica",
    price: 49.90,
    image: "/api/placeholder/300/300"
  }, {
    id: 3,
    name: "Jaqueta Jeans",
    price: 159.90,
    image: "/api/placeholder/300/300"
  }, {
    id: 4,
    name: "Vestido Floral",
    price: 129.90,
    image: "/api/placeholder/300/300"
  }, {
    id: 5,
    name: "Calça Jogger",
    price: 89.90,
    image: "/api/placeholder/300/300"
  }, {
    id: 6,
    name: "Blusa de Frio",
    price: 119.90,
    image: "/api/placeholder/300/300"
  }]
};

const Catalog = () => {
  const { storeSlug } = useParams();
  const [store] = useState(mockStore);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Olá! Vim pelo seu catálogo LinkBuy e gostaria de saber mais sobre seus produtos.`);
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const handleProductClick = (product: any) => {
    window.location.href = `/c/${storeSlug}/${product.id}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: store.backgroundColor }}>
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm min-h-screen">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-lg ring-4 ring-white/50 hover:shadow-xl transition-all duration-300">
            <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{store.name}</h1>
          <p className="text-muted-foreground mb-4">{store.description}</p>
          
          <Button 
            onClick={handleWhatsAppContact} 
            className="whatsapp-btn rounded-full hover:scale-105 transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </Button>
        </div>

        {/* Products Grid */}
        <div className="px-4 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {store.products.map((product, index) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product)} 
                className="product-card cursor-pointer rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-lg font-bold text-whatsapp">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-muted-foreground border-t bg-white/50 rounded-t-xl">
          Criado com 💚 no LinkBuy
        </div>
      </div>
    </div>
  );
};

export default Catalog;
