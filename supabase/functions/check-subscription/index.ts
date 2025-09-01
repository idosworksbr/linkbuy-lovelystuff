import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Mapear price_id para tipo de assinatura
const mapPriceIdToSubscriptionType = (priceId: string): string => {
  const priceMap: { [key: string]: string } = {
    'price_1S2d1xCTueMWV5IwvR6OudJR': 'pro',             // PLANO PRO
    'price_1S2dYWCTueMWV5IwSDVN59wL': 'pro_plus',        // PLANO PRO+
    'price_1S2dd5CTueMWV5Iwbi073tsC': 'verified',        // SELO VERIFICADO AVULSO
    'price_1S2db1CTueMWV5IwrNdtAKyy': 'pro_plus_verified' // PLANO PRO+ VERIFICADO
  };
  
  return priceMap[priceId] || 'pro'; // Default para 'pro' se não encontrar
};

// Retry function with exponential backoff for rate limits
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries: number = 3): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.type === 'StripeRateLimitError' && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        logStep(`Rate limit hit, retrying in ${delay}ms`, { attempt: i + 1 });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Use retry logic for Stripe API calls to handle rate limits
    const customers = await retryWithBackoff(() => 
      stripe.customers.list({ email: user.email, limit: 1 })
    );
    
    if (customers.data.length === 0) {
      logStep("No customer found, clearing all subscriptions");
      // Limpar todas as assinaturas ativas do usuário
      await supabaseClient
        .from("user_subscriptions")
        .update({ status: 'expired' })
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Buscar todas as assinaturas ativas do cliente
    const subscriptions = await retryWithBackoff(() => 
      stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 100, // Buscar até 100 assinaturas ativas
      })
    );

    logStep("Active subscriptions found", { count: subscriptions.data.length });

    // Marcar todas as assinaturas existentes como expiradas primeiro
    await supabaseClient
      .from("user_subscriptions")
      .update({ status: 'expired' })
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Processar cada assinatura ativa
    for (const subscription of subscriptions.data) {
      const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const subscriptionStart = new Date(subscription.current_period_start * 1000).toISOString();
      
      // Pegar o primeiro item da assinatura (pode ter múltiplos, mas vamos considerar o primeiro)
      const priceId = subscription.items.data[0].price.id;
      const subscriptionType = mapPriceIdToSubscriptionType(priceId);
      
      logStep("Processing subscription", { 
        subscriptionId: subscription.id, 
        priceId, 
        subscriptionType, 
        endDate: subscriptionEnd 
      });

      // Verificar se assinou Pro+ Verificado (plano completo)
      if (subscriptionType === 'pro_plus_verified') {
        // Se assinou Pro+ Verificado, cancelar outras assinaturas separadas no Stripe
        const otherSubscriptions = subscriptions.data.filter(sub => sub.id !== subscription.id);
        for (const otherSub of otherSubscriptions) {
          const otherPriceId = otherSub.items.data[0].price.id;
          const otherType = mapPriceIdToSubscriptionType(otherPriceId);
          
          if (['pro_plus', 'verified', 'pro'].includes(otherType)) {
            logStep("Canceling redundant subscription", { 
              subscriptionId: otherSub.id, 
              type: otherType 
            });
            
            try {
              await retryWithBackoff(() => 
                stripe.subscriptions.cancel(otherSub.id)
              );
            } catch (error) {
              logStep("Error canceling subscription", { 
                subscriptionId: otherSub.id, 
                error: error.message 
              });
            }
          }
        }
        
        logStep("Canceled separate subscriptions due to Pro+ Verified");
      }

      // Upsert a assinatura na tabela user_subscriptions
      await supabaseClient.from("user_subscriptions").upsert({
        user_id: user.id,
        subscription_type: subscriptionType,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: 'active',
        current_period_start: subscriptionStart,
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id,subscription_type',
        ignoreDuplicates: false 
      });
    }

    // Buscar as assinaturas ativas finais para retornar o status
    const { data: activeSubscriptions } = await supabaseClient
      .from("user_subscriptions")
      .select("subscription_type, current_period_end")
      .eq('user_id', user.id)
      .eq('status', 'active');

    const hasActiveSubscriptions = activeSubscriptions && activeSubscriptions.length > 0;
    const subscriptionTypes = activeSubscriptions?.map(sub => sub.subscription_type) || [];
    const maxEndDate = activeSubscriptions?.reduce((max, sub) => 
      new Date(sub.current_period_end) > new Date(max) ? sub.current_period_end : max, 
      activeSubscriptions[0]?.current_period_end || null
    );

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSubscriptions, 
      subscriptionTypes,
      maxEndDate 
    });

    // O trigger sync_user_subscriptions_to_profile() já atualizará o perfil automaticamente
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSubscriptions,
      subscription_types: subscriptionTypes,
      subscription_end: maxEndDate
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});