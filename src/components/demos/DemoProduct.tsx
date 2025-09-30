import React from 'react';
import { cn } from '@/lib/utils';
import { DiscountAnimation } from '@/components/DiscountAnimation';
import { getProductPrices } from '@/lib/priceUtils';

export interface DemoProductData {
  id: string;
  name: string;
  emoji: string;
  price: number;
  discount?: number;
  discountAnimationEnabled?: boolean;
  discountAnimationColor?: string;
  category?: string;
}

interface DemoProductProps {
  product: DemoProductData;
  layout: 'overlay' | 'bottom';
  gridStyle: 'default' | 'round' | 'instagram';
  theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  onClick?: () => void;
  textBackgroundEnabled?: boolean;
  textBackgroundColor?: string;
  textBackgroundOpacity?: number;
  nameTextColor?: string;
  priceTextColor?: string;
}

export const DemoProduct: React.FC<DemoProductProps> = ({
  product,
  layout,
  gridStyle,
  theme,
  onClick,
  textBackgroundEnabled,
  textBackgroundColor,
  textBackgroundOpacity,
  nameTextColor,
  priceTextColor,
}) => {
  const { originalPrice, finalPrice, hasDiscount, discountPercentage, formattedOriginalPrice, formattedFinalPrice } = 
    getProductPrices(product);

  const renderContent = () => {
    const isInstagram = gridStyle === 'instagram';
    const isOverlay = layout === 'overlay';
    const isRound = gridStyle === 'round';

    // Estilo do emoji (imagem)
    const emojiStyle = cn(
      "w-full flex items-center justify-center text-8xl select-none",
      isRound ? "aspect-square" : isInstagram ? "aspect-[4/5]" : "aspect-square",
      isOverlay && "absolute inset-0"
    );

    // Estilo do container de texto
    const textContainerStyle = cn(
      "p-3 space-y-1",
      isOverlay && "absolute bottom-0 left-0 right-0",
      textBackgroundEnabled && isOverlay && "backdrop-blur-sm",
      !isOverlay && "bg-card"
    );

    // Estilo do background do texto (se habilitado)
    const textBackgroundStyle = textBackgroundEnabled && textBackgroundColor
      ? {
          backgroundColor: textBackgroundColor,
          opacity: textBackgroundOpacity ? textBackgroundOpacity / 100 : 0.9,
        }
      : {};

    return (
      <>
        {/* Emoji como imagem */}
        <div className={emojiStyle} style={{ background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--muted)) 100%)' }}>
          {product.emoji}
        </div>

        {/* Informações do produto */}
        <div className={textContainerStyle} style={isOverlay ? textBackgroundStyle : {}}>
          <h3 
            className={cn("font-bold text-sm line-clamp-2 uppercase", nameTextColor ? "" : "text-foreground")}
            style={nameTextColor ? { color: nameTextColor } : {}}
          >
            {product.name}
          </h3>
          
          <div className="flex flex-col gap-0.5">
            {hasDiscount && (
              <span className={cn("text-xs line-through", priceTextColor ? "opacity-60" : "text-muted-foreground")} style={priceTextColor ? { color: priceTextColor, opacity: 0.6 } : {}}>
                R$ {formattedOriginalPrice}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span 
                className={cn("font-bold text-base", hasDiscount ? "text-whatsapp" : "text-foreground")}
                style={priceTextColor && !hasDiscount ? { color: priceTextColor } : {}}
              >
                R$ {formattedFinalPrice}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  };

  const cardStyle = cn(
    "relative overflow-hidden cursor-pointer transition-all duration-300",
    "hover:shadow-xl hover:-translate-y-1",
    gridStyle === 'round' && "rounded-full",
    gridStyle === 'instagram' && "rounded-xl",
    gridStyle === 'default' && "rounded-lg",
    layout === 'overlay' ? "group" : "bg-card border border-border"
  );

  const content = (
    <div className={cardStyle} onClick={onClick}>
      {renderContent()}
    </div>
  );

  // Wrap com animação LED se habilitado
  if (hasDiscount && product.discountAnimationEnabled) {
    return (
      <DiscountAnimation 
        enabled={true} 
        color={product.discountAnimationColor || '#ef4444'}
      >
        {content}
      </DiscountAnimation>
    );
  }

  return content;
};
