import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-REDUNDANT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { newSubscriptionType, userId } = await req.json();
    
    if (!newSubscriptionType || !userId) {
      throw new Error("Missing newSubscriptionType or userId");
    }

    logStep("Processing redundant subscription cancellation", { newSubscriptionType, userId });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Se assinou Pro+ Verificado, cancelar Pro+ e Verificado separados
    if (newSubscriptionType === 'pro_plus_verified') {
      logStep("Canceling redundant subscriptions for Pro+ Verified");
      
      // Buscar assinaturas ativas que devem ser canceladas
      const { data: subscriptionsToCancel } = await supabaseClient
        .from("user_subscriptions")
        .select("*")
        .eq('user_id', userId)
        .in('subscription_type', ['pro_plus', 'verified'])
        .eq('status', 'active');

      logStep("Found subscriptions to cancel", { count: subscriptionsToCancel?.length || 0 });

      if (subscriptionsToCancel && subscriptionsToCancel.length > 0) {
        for (const subscription of subscriptionsToCancel) {
          try {
            // Cancelar no Stripe
            await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
            
            // Atualizar status no banco
            await supabaseClient
              .from("user_subscriptions")
              .update({ status: 'canceled' })
              .eq('id', subscription.id);

            logStep("Canceled subscription", { 
              subscriptionId: subscription.stripe_subscription_id,
              type: subscription.subscription_type 
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logStep("Error canceling subscription", { 
              subscriptionId: subscription.stripe_subscription_id,
              error: errorMessage 
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-redundant-subscriptions", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});