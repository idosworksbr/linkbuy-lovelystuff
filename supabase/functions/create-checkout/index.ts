import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[create-checkout] Função iniciada - v3');

  // Create a Supabase client using the anon key for authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Verificar se a chave do Stripe está configurada
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error('[create-checkout] STRIPE_SECRET_KEY não configurada');
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    console.log('[create-checkout] Stripe key encontrada');

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('[create-checkout] Authorization header não encontrado');
      throw new Error("Authorization header is required");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log('[create-checkout] Autenticando usuário...');
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) {
      console.error('[create-checkout] Erro de autenticação:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }

    const user = data.user;
    if (!user?.email) {
      console.error('[create-checkout] Usuário não autenticado ou sem email');
      throw new Error("User not authenticated or email not available");
    }
    console.log('[create-checkout] Usuário autenticado:', user.email);

    const { priceId } = await req.json();
    if (!priceId) {
      console.error('[create-checkout] Price ID não fornecido');
      throw new Error("Price ID is required");
    }
    console.log('[create-checkout] Price ID recebido:', priceId);

    console.log('[create-checkout] Inicializando cliente Stripe...');
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16" 
    });
    
    console.log('[create-checkout] Buscando cliente existente...');
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('[create-checkout] Cliente existente encontrado:', customerId);
    } else {
      console.log('[create-checkout] Nenhum cliente existente encontrado');
    }

    const origin = req.headers.get("origin") || "https://rpkawimruhfqhxbpavce.supabase.co";
    console.log('[create-checkout] Origin detectado:', origin);

    console.log('[create-checkout] Criando sessão de checkout...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard/plans?canceled=true`,
    });

    console.log('[create-checkout] Sessão criada com sucesso:', session.id);
    console.log('[create-checkout] URL do checkout:', session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[create-checkout] Erro na função:', errorMessage);
    console.error('[create-checkout] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});