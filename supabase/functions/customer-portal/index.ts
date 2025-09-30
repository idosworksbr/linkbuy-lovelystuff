import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    logStep("Function started - v4");

    // Enhanced environment validation
    logStep("Validating environment configuration");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      logStep("Available Stripe env vars", Object.keys(Deno.env.toObject()).filter(key => key.includes('STRIPE')));
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    
    if (!stripeKey.startsWith('sk_')) {
      logStep("ERROR: Invalid Stripe key format");
      throw new Error("Invalid STRIPE_SECRET_KEY format");
    }
    
    logStep("Stripe key validated", { keyPrefix: stripeKey.substring(0, 7) + '...' });

    // Initialize Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    logStep("Initializing Stripe client");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Test Stripe connectivity
    logStep("Testing Stripe connectivity");
    try {
      const testResult = await stripe.customers.list({ limit: 1 });
      logStep("Stripe connectivity successful", { testCount: testResult.data.length });
    } catch (connectError) {
      const errorMessage = connectError instanceof Error ? connectError.message : String(connectError);
      logStep("ERROR: Stripe connectivity failed", { error: errorMessage });
      throw new Error(`Stripe connection failed: ${errorMessage}`);
    }

    logStep("Searching for customer", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("ERROR: No customer found", { email: user.email });
      throw new Error("No Stripe customer found for this user. Please subscribe to a plan first.");
    }
    const customerId = customers.data[0].id;
    logStep("Customer found successfully", { customerId, email: user.email });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/dashboard`,
      });
      logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (portalError) {
      const portalErrorMessage = portalError instanceof Error ? portalError.message : String(portalError);
      
      // Check if it's the configuration error
      if (portalErrorMessage.includes("No configuration provided")) {
        logStep("ERROR: Customer Portal not configured in Stripe");
        return new Response(JSON.stringify({ 
          error: "O Customer Portal do Stripe precisa ser configurado primeiro. Por favor, acesse https://dashboard.stripe.com/settings/billing/portal e configure o portal do cliente para continuar."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      throw portalError; // Re-throw other errors
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});