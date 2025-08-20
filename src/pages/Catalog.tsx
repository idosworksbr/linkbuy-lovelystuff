
import { useState } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle, Grid3X3 } from "lucide-react";
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
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header Profile Section */}
        <div className="px-4 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-2 ring-gray-200">
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl font-semibold mb-1">{store.name}</h1>
              
              {/* Stats Row */}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{store.products.length}</div>
                  <div className="text-gray-500">Posts</div>
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
          <p className="text-sm text-gray-700 mb-4">{store.description}</p>

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
          <div className="grid grid-cols-3 gap-1">
            {store.products.map((product, index) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product)} 
                className="relative aspect-square cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
                
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
