// Configurações padrão para catálogos sem assinatura ativa
export const DEFAULT_CATALOG_CONFIG = {
  catalog_theme: 'light' as const,
  catalog_layout: 'bottom' as const,
  product_grid_layout: 'default' as const,
  hide_footer: false,
  is_verified: false,
  custom_background_enabled: false,
  background_type: 'color' as const,
  background_color: '#ffffff',
  background_image_url: null,
  show_mylinkbuy_credits: true,
} as const;

// Função para aplicar configurações padrão quando assinatura não está ativa
export const applyDefaultConfigIfNeeded = (store: any, hasActiveSubscription: boolean) => {
  if (hasActiveSubscription) {
    return {
      ...store,
      show_mylinkbuy_credits: false // Esconder créditos para assinantes
    };
  }

  // Aplicar configurações padrão para não assinantes
  return {
    ...store,
    ...DEFAULT_CATALOG_CONFIG,
    // Manter dados básicos obrigatórios
    id: store.id,
    store_name: store.store_name,
    store_url: store.store_url,
    profile_photo_url: store.profile_photo_url,
    whatsapp_number: store.whatsapp_number,
    instagram_url: store.instagram_url,
    custom_whatsapp_message: store.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
    created_at: store.created_at,
    store_description: null, // Ocultar descrição para não assinantes
  };
};

// Função para verificar se deve ocultar links externos
export const shouldHideCustomLinks = (hasActiveSubscription: boolean): boolean => {
  return !hasActiveSubscription;
};