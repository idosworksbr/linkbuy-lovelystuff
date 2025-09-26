import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

interface ProductPreviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
  themeClasses: any;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  product,
  isOpen,
  onClose,
  onBuyNow,
  themeClasses
}) => {
  if (!product) return null;

  const prices = getProductPrices(product);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md mx-auto rounded-2xl p-0 overflow-hidden ${themeClasses.card}`}>
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{ userSelect: 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-4xl">📷</span>
              </div>
            )}
            
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
          </div>

          {/* Product Info */}
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-2 ${themeClasses.text}`}>
              {product.name}
            </h3>
            
            {/* Price */}
            <div className="mb-4">
              {prices.hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className={`text-lg line-through ${themeClasses.textMuted}`}>
                    R$ {prices.formattedOriginalPrice}
                  </span>
                  <span className="text-2xl font-bold text-success">
                    R$ {prices.formattedFinalPrice}
                  </span>
                  <span className="bg-destructive text-destructive-foreground text-sm px-2 py-1 rounded-full font-medium">
                    -{prices.discountPercentage}%
                  </span>
                </div>
              ) : (
                <span className={`text-2xl font-bold ${themeClasses.text}`}>
                  R$ {prices.formattedFinalPrice}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className={`mb-6 leading-relaxed ${themeClasses.textMuted}`}>
                {product.description}
              </p>
            )}

            {/* Buy Button */}
            <Button
              onClick={() => onBuyNow(product)}
              className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground font-semibold py-3 rounded-xl transition-all hover:scale-105"
              size="lg"
            >
              Comprar Agora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};