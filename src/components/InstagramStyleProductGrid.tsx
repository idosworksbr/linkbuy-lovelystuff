import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { getProductPrices } from '@/lib/priceUtils';
import { DiscountAnimation } from '@/components/DiscountAnimation';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  discount_animation_enabled?: boolean;
  discount_animation_color?: string;
  images: string[];
}

interface InstagramStyleProductGridProps {
  products: Product[];
  onBuyNow: (product: Product) => void;
  themeClasses: any;
}

export const InstagramStyleProductGrid: React.FC<InstagramStyleProductGridProps> = ({
  products,
  onBuyNow,
  themeClasses
}) => {
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});

  const handlePrevImage = (productId: string, totalImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const handleNextImage = (productId: string, totalImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  const getCurrentImageIndex = (productId: string) => imageIndexes[productId] || 0;

  return (
    <div className="space-y-6">
      {products.map((product) => {
        const prices = getProductPrices(product);
        const currentImageIndex = getCurrentImageIndex(product.id);
        const hasMultipleImages = product.images && product.images.length > 1;

        return (
          <div
            key={product.id}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in"
          >
            {/* Image Container with Carousel */}
            <div className="relative aspect-square bg-muted">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Discount Animation */}
                  {prices.hasDiscount && product.discount_animation_enabled && (
                    <DiscountAnimation
                      enabled={true}
                      color={product.discount_animation_color || '#ff0000'}
                      className="absolute top-4 right-4 z-10"
                    >
                      <div className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-bold">
                        -{prices.discountPercentage}%
                      </div>
                    </DiscountAnimation>
                  )}

                  {/* Carousel Controls */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={() => handlePrevImage(product.id, product.images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleNextImage(product.id, product.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {product.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setImageIndexes(prev => ({ ...prev, [product.id]: index }))}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl opacity-50">📷</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-2">
                {product.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                {prices.hasDiscount ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {prices.formattedOriginalPrice}
                    </span>
                    <span className="text-xl font-bold text-success">
                      R$ {prices.formattedFinalPrice}
                    </span>
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-medium">
                      -{prices.discountPercentage}%
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-foreground">
                    R$ {prices.formattedFinalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Buy Button */}
              <Button
                onClick={() => onBuyNow(product)}
                className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground font-semibold rounded-xl transition-all hover:scale-105"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Comprar Agora
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};