import { Profile } from "./useProfile";

export interface PlanFeatures {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
  verified?: boolean;
}

export interface PlanPricing {
  name: string;
  stripeId: string;
  price: string;
  features: string[];
  popular?: boolean;
  verified?: boolean;
}

export const plans: PlanPricing[] = [
  {
    name: "Free",
    stripeId: "",
    price: "Grátis",
    features: [
      "Produtos ilimitados",
      "Link Instagram",
      "Link WhatsApp", 
      "Número do WhatsApp",
      "Nome da loja no catálogo",
      "Foto do perfil"
    ]
  },
  {
    name: "Pro",
    stripeId: "price_1S2d1xCTueMWV5IwvR6OudJR",
    price: "R$ 19,90/mês",
    popular: true,
    features: [
      "Tudo do Free",
      "Mensagem personalizada WhatsApp",
      "Escolher tema do catálogo",
      "Personalizar plano de fundo",
      "Visualização da grade personalizada",
      "Configurar mensagem na bio",
      "Links personalizados"
    ]
  },
  {
    name: "Pro+",
    stripeId: "price_1S2d2UCTueMWV5IwJ1K8V7gH",
    price: "R$ 39,90/mês", 
    features: [
      "Tudo do Free e Pro",
      "Configurações avançadas",
      "Esconder rodapé",
      "Escolher URL da loja",
      "Acesso ao analytics"
    ]
  },
  {
    name: "Selo Verificado",
    stripeId: "price_1S2d2xCTueMWV5IwZvE9X5bK",
    price: "R$ 9,90/mês",
    verified: true,
    features: [
      "Selo de verificado para catálogo"
    ]
  },
  {
    name: "Pro+ Verificado",
    stripeId: "price_1S2d3QCTueMWV5IwL9M4H2rN",
    price: "R$ 49,90/mês",
    features: [
      "Toda a plataforma inclusa",
      "Todos os recursos Pro+",
      "Selo de verificado"
    ]
  }
];

export const usePlans = () => {
  const canAccessFeature = (profile: Profile | null, feature: string): boolean => {
    if (!profile) return false;

    const plan = profile.subscription_plan;
    const isVerified = profile.is_verified;

    switch (feature) {
      // Free features - always available
      case 'unlimited_products':
      case 'instagram_link':
      case 'whatsapp_link':
      case 'whatsapp_number':
      case 'store_name':
      case 'profile_photo':
        return true;

      // Pro features
      case 'custom_whatsapp_message':
      case 'catalog_theme':
      case 'custom_background':
      case 'grid_layout':
      case 'bio_message':
      case 'custom_links':
        return ['pro', 'pro_plus', 'pro_plus_verified'].includes(plan);

      // Pro+ features
      case 'advanced_settings':
      case 'hide_footer':
      case 'custom_store_url':
      case 'analytics':
        return ['pro_plus', 'pro_plus_verified'].includes(plan);

      // Verified features
      case 'verified_badge':
        return isVerified || ['verified', 'pro_plus_verified'].includes(plan);

      default:
        return false;
    }
  };

  const getPlanName = (plan: string): string => {
    switch (plan) {
      case 'free': return 'Free';
      case 'pro': return 'Pro';
      case 'pro_plus': return 'Pro+';
      case 'verified': return 'Selo Verificado';
      case 'pro_plus_verified': return 'Pro+ Verificado';
      default: return 'Free';
    }
  };

  const isExpired = (profile: Profile | null): boolean => {
    if (!profile?.subscription_expires_at) return false;
    return new Date(profile.subscription_expires_at) < new Date();
  };

  return {
    plans,
    canAccessFeature,
    getPlanName,
    isExpired
  };
};