import { loadStripe } from '@stripe/stripe-js';

// Configuração centralizada do Stripe
export const STRIPE_CONFIG = {
  // Chave pública - será carregada do ambiente em produção
  publishableKey: "pk_live_51S2cpKFhG2EqaMMarWCOKw3EDm5iwwM7G50tefRYeHUjP18iuSnAsuVovc1drMFdp7BZMoq4GvA1joXvbSLYW8ru00kZN9qEDo",
  
  // Price IDs centralizados para todos os planos
  priceIds: {
    pro: "price_1S2k58FhG2EqaMMaAifmR8iL",
    pro_plus: "price_1S2k55FhG2EqaMMaNHnafbQR", 
    verified: "price_1S2k51FhG2EqaMMaJqiDgzMI",
    pro_plus_verified: "price_1S2k54FhG2EqaMMa5PNk8gfV"
  },
  
  // Configurações de timeout para produção
  timeouts: {
    checkout: 15000,        // 15s instead of 30s
    subscription: 15000,    // 15s instead of 30s
    prices: 15000          // 15s instead of 30s
  },
  
  // URLs de redirecionamento para produção
  urls: {
    success: "/dashboard?payment=success",
    cancel: "/dashboard/plans?payment=cancelled"
  }
} as const;

// Initialize Stripe instance
export const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

// Helper para obter Price ID por nome do plano
export const getPriceIdByPlan = (planName: string): string | null => {
  const normalizedName = planName.toLowerCase().replace(/\s+/g, '_').replace(/\+/g, '_plus');
  
  switch (normalizedName) {
    case 'pro':
      return STRIPE_CONFIG.priceIds.pro;
    case 'pro_plus':
    case 'pro+':
      return STRIPE_CONFIG.priceIds.pro_plus;
    case 'selo_verificado':
    case 'verificado':
      return STRIPE_CONFIG.priceIds.verified;
    case 'pro_plus_verificado':
    case 'pro+_verificado':
      return STRIPE_CONFIG.priceIds.pro_plus_verified;
    default:
      return null;
  }
};

// Helper para mapear Price ID para nome do plano
export const mapPriceIdToPlanName = (priceId: string): string => {
  switch (priceId) {
    case STRIPE_CONFIG.priceIds.pro:
      return 'Pro';
    case STRIPE_CONFIG.priceIds.pro_plus:
      return 'Pro+';
    case STRIPE_CONFIG.priceIds.verified:
      return 'Selo Verificado';
    case STRIPE_CONFIG.priceIds.pro_plus_verified:
      return 'Pro+ Verificado';
    default:
      return 'Desconhecido';
  }
};