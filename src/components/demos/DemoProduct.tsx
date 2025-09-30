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
      "w-full flex items-center justify-center select-none bg-muted/30 rounded-t-2xl",
      "text-6xl aspect-square"
    );

    // Estilo do container de texto
    const textContainerStyle = cn(
      "p-3 space-y-1 bg-white"
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
        <div className={emojiStyle}>
          {product.emoji}
        </div>

        {/* Informações do produto */}
        <div className={textContainerStyle}>
          <h3 className="font-bold text-xs line-clamp-2 uppercase text-foreground">
            {product.name}
          </h3>
          
          <div className="flex flex-col gap-0.5">
            {hasDiscount && (
              <span className="text-[10px] line-through text-muted-foreground">
                R$ {formattedOriginalPrice}
              </span>
            )}
            <span className={cn("font-bold text-sm", hasDiscount ? "text-whatsapp" : "text-foreground")}>
              R$ {formattedFinalPrice}
            </span>
          </div>
        </div>
      </>
    );
  };

  const cardStyle = cn(
    "relative overflow-hidden cursor-pointer transition-all duration-300",
    "hover:shadow-lg hover:-translate-y-0.5",
    "rounded-2xl bg-white border border-border shadow-sm"
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
