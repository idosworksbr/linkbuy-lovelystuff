
import { useState } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle, Instagram, Facebook, Twitter, Youtube, Mail, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - em produção viria de uma API baseada no storeSlug
const mockStore = {
  name: "Minha Loja Fashion",
  description: "Roupas e acessórios com estilo único",
  logo: "/api/placeholder/150/150",
  backgroundColor: "#f8fafc",
  socialLinks: [
    { type: "instagram", url: "https://instagram.com/minhaloja", label: "@minhaloja" },
    { type: "facebook", url: "https://facebook.com/minhaloja", label: "Minha Loja Fashion" },
    { type: "whatsapp", url: "https://wa.me/5511999999999", label: "(11) 99999-9999" }
  ],
  products: [
    {
      id: 1,
      name: "Tênis Esportivo Premium",
      price: 299.90,
      image: "/api/placeholder/300/300"
    },
    {
      id: 2,
      name: "Camiseta Básica",
      price: 49.90,
      image: "/api/placeholder/300/300"
    },
    {
      id: 3,
      name: "Jaqueta Jeans",
      price: 159.90,
      image: "/api/placeholder/300/300"
    },
    {
      id: 4,
      name: "Vestido Floral",
      price: 129.90,
      image: "/api/placeholder/300/300"
    },
    {
      id: 5,
      name: "Calça Jogger",
      price: 89.90,
      image: "/api/placeholder/300/300"
    },
    {
      id: 6,
      name: "Blusa de Frio",
      price: 119.90,
      image: "/api/placeholder/300/300"
    }
  ]
};

const getSocialIcon = (type: string) => {
  const iconProps = { className: "h-5 w-5" };
  
  switch (type) {
    case "instagram":
      return <Instagram {...iconProps} />;
    case "facebook":
      return <Facebook {...iconProps} />;
    case "twitter":
      return <Twitter {...iconProps} />;
    case "youtube":
      return <Youtube {...iconProps} />;
    case "whatsapp":
      return <MessageCircle {...iconProps} />;
    case "email":
      return <Mail {...iconProps} />;
    case "website":
      return <Globe {...iconProps} />;
    case "phone":
      return <Phone {...iconProps} />;
    default:
      return <Globe {...iconProps} />;
  }
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

  const handleSocialLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: store.backgroundColor }}
    >
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm min-h-screen">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-lg">
            <img 
              src={store.logo} 
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{store.name}</h1>
          <p className="text-muted-foreground mb-4">{store.description}</p>
          
          {/* Social Links */}
          {store.socialLinks && store.socialLinks.length > 0 && (
            <div className="flex justify-center gap-3 mb-4">
              {store.socialLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleSocialLinkClick(link.url)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white/90 rounded-full transition-colors border border-border"
                  title={link.label}
                >
                  {getSocialIcon(link.type)}
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              ))}
            </div>
          )}
          
          <Button 
            className="whatsapp-btn"
            onClick={handleWhatsAppContact}
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </Button>
        </div>

        {/* Products Grid */}
        <div className="px-4 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {store.products.map((product) => (
              <div
                key={product.id}
                className="product-card cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium line-clamp-2 leading-tight">
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
        <div className="text-center py-6 text-xs text-muted-foreground border-t bg-white/50">
          Criado com 💚 no LinkBuy
        </div>
      </div>
    </div>
  );
};

export default Catalog;
