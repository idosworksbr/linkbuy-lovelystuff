/**
 * Utility functions for handling product prices and discounts
 */

export interface ProductPrice {
  id: string;
  name: string;
  price: number;
  discount?: number | null;
}

/**
 * Calculate the final price after applying discount
 * @param price Original price
 * @param discount Discount percentage (0-100)
 * @returns Final price after discount
 */
export const calculateDiscountedPrice = (price: number, discount?: number | null): number => {
  if (!discount || discount <= 0 || discount > 100) {
    return price;
  }
  
  const discountAmount = (price * discount) / 100;
  return price - discountAmount;
};

/**
 * Check if product has a valid discount
 * @param discount Discount percentage
 * @returns True if discount is valid and applicable
 */
export const hasValidDiscount = (discount?: number | null): boolean => {
  return discount !== null && discount !== undefined && discount > 0 && discount <= 100;
};

/**
 * Format price to Brazilian currency format (R$ XX,XX)
 * @param price Price value
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return price.toFixed(2).replace('.', ',');
};

/**
 * Get display prices for a product (original and discounted if applicable)
 * @param product Product with price and discount
 * @returns Object with original price, final price, and discount info
 */
export const getProductPrices = (product: ProductPrice) => {
  const originalPrice = product.price;
  const finalPrice = calculateDiscountedPrice(originalPrice, product.discount);
  const hasDiscount = hasValidDiscount(product.discount);
  
  return {
    originalPrice,
    finalPrice,
    hasDiscount,
    discountPercentage: product.discount || 0,
    formattedOriginalPrice: formatPrice(originalPrice),
    formattedFinalPrice: formatPrice(finalPrice),
  };
};