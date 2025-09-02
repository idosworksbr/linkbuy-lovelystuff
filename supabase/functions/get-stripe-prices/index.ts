import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[get-stripe-prices] Função iniciada - v2');

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error('[get-stripe-prices] STRIPE_SECRET_KEY não configurada');
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    console.log('[get-stripe-prices] Stripe key encontrada');

    console.log('[get-stripe-prices] Inicializando cliente Stripe...');
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    console.log('[get-stripe-prices] Buscando preços ativos...');
    // Buscar todos os preços ativos
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    console.log(`[get-stripe-prices] ${prices.data.length} preços encontrados`);

    // Mapear preços para formato mais limpo
    const formattedPrices = prices.data.map(price => {
      const formatted = {
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        product_name: (price.product as any)?.name || "",
      };
      console.log('[get-stripe-prices] Preço formatado:', formatted);
      return formatted;
    });

    console.log('[get-stripe-prices] Preços processados com sucesso');

    return new Response(JSON.stringify({ prices: formattedPrices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[get-stripe-prices] Erro na função:', errorMessage);
    console.error('[get-stripe-prices] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});