// Configuração segura do Stripe - SEM CHAVES HARDCODED
// Todas as chaves devem vir das variáveis de ambiente do Supabase

export const STRIPE_SECURE_CONFIG = {
  // Price IDs centralizados para todos os planos
  priceIds: {
    pro: "price_1S2k58FhG2EqaMMaAifmR8iL",
    pro_plus: "price_1S2k55FhG2EqaMMaNHnafbQR", 
    verified: "price_1S2k51FhG2EqaMMaJqiDgzMI",
    pro_plus_verified: "price_1S2k54FhG2EqaMMa5PNk8gfV"
  },
  
  // Configurações de timeout para produção
  timeouts: {
    checkout: 15000,
    subscription: 15000,
    prices: 15000
  },
  
  // URLs de redirecionamento para produção
  urls: {
    success: "/dashboard?payment=success",
    cancel: "/dashboard/plans?payment=cancelled"
  }
} as const;

// Helper para obter Price ID por nome do plano
export const getPriceIdByPlan = (planName: string): string | null => {
  const normalizedName = planName.toLowerCase().replace(/\s+/g, '_').replace(/\+/g, '_plus');
  
  switch (normalizedName) {
    case 'pro':
      return STRIPE_SECURE_CONFIG.priceIds.pro;
    case 'pro_plus':
    case 'pro+':
      return STRIPE_SECURE_CONFIG.priceIds.pro_plus;
    case 'selo_verificado':
    case 'verificado':
      return STRIPE_SECURE_CONFIG.priceIds.verified;
    case 'pro_plus_verificado':
    case 'pro+_verificado':
      return STRIPE_SECURE_CONFIG.priceIds.pro_plus_verified;
    default:
      return null;
  }
};

// Helper para mapear Price ID para nome do plano
export const mapPriceIdToPlanName = (priceId: string): string => {
  switch (priceId) {
    case STRIPE_SECURE_CONFIG.priceIds.pro:
      return 'Pro';
    case STRIPE_SECURE_CONFIG.priceIds.pro_plus:
      return 'Pro+';
    case STRIPE_SECURE_CONFIG.priceIds.verified:
      return 'Selo Verificado';
    case STRIPE_SECURE_CONFIG.priceIds.pro_plus_verified:
      return 'Pro+ Verificado';
    default:
      return 'Desconhecido';
  }
};

// Função para obter chave pública do Stripe de forma segura
export const getStripePublishableKey = (): string | null => {
  // TODO: Substitua pela sua chave pública real do Stripe (pk_live_... ou pk_test_...)
  const STRIPE_PUBLISHABLE_KEY = ""; // ← ADICIONE SUA CHAVE PÚBLICA AQUI
  
  const publishableKey = STRIPE_PUBLISHABLE_KEY || 
                        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                        (typeof window !== 'undefined' && (window as any).STRIPE_PUBLIC_KEY);

  if (publishableKey && (publishableKey.startsWith('pk_live_') || publishableKey.startsWith('pk_test_'))) {
    return publishableKey;
  }

  console.warn('⚠️ Chave pública do Stripe não configurada - adicione sua pk_live_... ou pk_test_...');
  return null;
};