import { useState, useEffect } from "react";
import { Profile } from "./useProfile";
import { supabase } from "@/integrations/supabase/client";

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

export const defaultPlans: PlanPricing[] = [
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
    price: "Carregando...",
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
    stripeId: "price_1S2dYWCTueMWV5IwSDVN59wL",
    price: "Carregando...", 
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
    stripeId: "price_1S2dd5CTueMWV5Iwbi073tsC",
    price: "Carregando...",
    verified: true,
    features: [
      "Selo de verificado para catálogo",
      "Pode ser combinado com outros planos",
      "Aumenta credibilidade da loja"
    ]
  },
  {
    name: "Pro+ Verificado",
    stripeId: "price_1S2db1CTueMWV5IwrNdtAKyy",
    price: "Carregando...",
    verified: true,
    features: [
      "Toda a plataforma inclusa",
      "Todos os recursos Pro+",
      "Selo de verificado"
    ]
  }
];

export const usePlans = () => {
  const [plans, setPlans] = useState<PlanPricing[]>(defaultPlans);

  useEffect(() => {
    const fetchRealPrices = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-stripe-prices');
        
        if (error) {
          console.error('Error fetching Stripe prices:', error);
          return;
        }

        const stripePrices = data.prices;
        
        setPlans(prevPlans => 
          prevPlans.map(plan => {
            // Não alterar o plano Free
            if (plan.stripeId === "") return plan;

            const stripePrice = stripePrices.find((p: any) => p.id === plan.stripeId);
            if (!stripePrice) return plan;

            // Formatar preço baseado nos dados do Stripe
            const amount = stripePrice.unit_amount / 100;
            const currency = stripePrice.currency.toUpperCase();
            const interval = stripePrice.recurring?.interval || 'month';
            
            const formattedPrice = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: currency === 'USD' ? 'BRL' : currency, // Converter USD para BRL na exibição
            }).format(amount);

            const intervalText = interval === 'month' ? 'mês' : 'ano';

            return {
              ...plan,
              price: `${formattedPrice}/${intervalText}`
            };
          })
        );
      } catch (error) {
        console.error('Error updating plan prices:', error);
      }
    };

    fetchRealPrices();
  }, []);
  const canAccessFeature = (profile: Profile | null, feature: string): boolean => {
    if (!profile) return false;

    const plan = profile.subscription_plan || 'free';
    const isVerified = profile.is_verified || false;

    switch (feature) {
      // Free features - always available
      case 'unlimited_products':
      case 'instagram_link':
      case 'whatsapp_link':
      case 'whatsapp_number':
      case 'store_name':
      case 'profile_photo':
        return true;

      // Pro features - disponível em planos Pro, Pro+, Pro+ Verificado, e também PRO + Verificado separado
      case 'custom_whatsapp_message':
      case 'catalog_theme':
      case 'custom_background':
      case 'grid_layout':
      case 'bio_message':
      case 'custom_links':
        return ['pro', 'pro_plus', 'pro_plus_verified'].includes(plan) ||
               (plan === 'pro' && isVerified); // PRO + Verificado separado tem acesso aos recursos PRO

      // Pro+ features - apenas Pro+ e Pro+ Verificado
      case 'advanced_settings':
      case 'hide_footer':
      case 'custom_store_url':
      case 'analytics':
        return ['pro_plus', 'pro_plus_verified'].includes(plan);

      // Verified features - acessível se o usuário for verificado (independente do plano)
      case 'verified_badge':
        return isVerified;

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