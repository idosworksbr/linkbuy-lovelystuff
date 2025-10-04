import { useState, useEffect } from "react";
import { Profile } from "./useProfile";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_CONFIG } from "@/lib/stripe";

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
    stripeId: STRIPE_CONFIG.priceIds.pro,
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
    stripeId: STRIPE_CONFIG.priceIds.pro_plus,
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
    name: "Pro+ Verificado",
    stripeId: "price_1S2k54FhG2EqaMMa5PNk8gfV",
    price: "Carregando...",
    verified: true,
    features: [
      "Tudo do Pro+",
      "Selo de Verificado ✓",
      "Prioridade no suporte",
      "Destaque no marketplace"
    ]
  }
];

export const usePlans = () => {
  const [plans, setPlans] = useState<PlanPricing[]>(defaultPlans);

  useEffect(() => {
    const fetchRealPrices = async () => {
      try {
        console.log('[usePlans] Iniciando busca de preços do Stripe...');
        
        // Timeout otimizado para produção
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na busca de preços')), STRIPE_CONFIG.timeouts.prices)
        );
        
        const result = await Promise.race([
          supabase.functions.invoke('get-stripe-prices'),
          timeoutPromise
        ]) as any;
        
        const { data, error } = result;
        
        if (error) {
          console.error('[usePlans] Erro ao buscar preços do Stripe:', error);
          console.error('[usePlans] Detalhes do erro:', JSON.stringify(error, null, 2));
          console.error('[usePlans] Usando preços padrão devido ao erro');
          return;
        }

        console.log('[usePlans] Resposta da função get-stripe-prices:', data);

        if (!data || !data.prices) {
          console.error('[usePlans] Resposta inválida da função - sem dados de preços');
          return;
        }

        const stripePrices = data.prices;
        console.log('[usePlans] Preços encontrados no Stripe:', stripePrices);
        
        setPlans(prevPlans => 
          prevPlans.map(plan => {
            // Não alterar o plano Free
            if (plan.stripeId === "") return plan;

            const stripePrice = stripePrices.find((p: any) => p.id === plan.stripeId);
            if (!stripePrice) {
              console.warn(`[usePlans] Preço não encontrado para o plano ${plan.name} (ID: ${plan.stripeId})`);
              return plan;
            }

            console.log(`[usePlans] Processando preço para ${plan.name}:`, stripePrice);

            // Formatar preço baseado nos dados do Stripe
            const amount = stripePrice.unit_amount / 100;
            const currency = stripePrice.currency.toUpperCase();
            const interval = stripePrice.recurring?.interval || 'month';
            
            // Usar a moeda real do Stripe sem conversão automática
            const formattedPrice = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: currency, // Usar a moeda real do Stripe
            }).format(amount);

            const intervalText = interval === 'month' ? 'mês' : 'ano';
            const finalPrice = `${formattedPrice}/${intervalText}`;

            console.log(`[usePlans] Preço formatado para ${plan.name}: ${finalPrice}`);

            return {
              ...plan,
              price: finalPrice
            };
          })
        );

        console.log('[usePlans] Preços atualizados com sucesso');
      } catch (error) {
        console.error('[usePlans] Erro inesperado ao atualizar preços:', error);
        console.error('[usePlans] Stack trace:', error instanceof Error ? error.stack : 'N/A');
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
      case 'themes':
      case 'layouts':
      case 'grid_layouts':
      case 'customization':
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

      // Premium animations - apenas Pro+ e Pro+ Verificado
      case 'premium_animations':
        return ['pro_plus', 'pro_plus_verified'].includes(plan);

      // Lead capture - disponível em planos Pro, Pro+ e Pro+ Verificado
      case 'lead_capture':
        return ['pro', 'pro_plus', 'pro_plus_verified'].includes(plan) ||
               (plan === 'pro' && isVerified);

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