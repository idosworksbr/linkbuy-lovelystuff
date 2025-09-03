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

  // Enhanced logging function
  const logStep = (step: string, details?: any) => {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
  };

  logStep("Function started - v5");

  // Enhanced environment validation
  logStep("Checking environment variables");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  
  logStep("Environment check", {
    hasSupabaseUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasStripeKey: !!stripeKey,
    allEnvVars: Object.keys(Deno.env.toObject())
  });

  // Create a Supabase client using the anon key for authentication
  const supabaseClient = createClient(
    supabaseUrl ?? "",
    supabaseAnonKey ?? ""
  );

  try {
    // Enhanced authentication validation
    logStep("Validating user authentication");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Extracting user from token");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      logStep("ERROR: Authentication failed", { error: authError.message });
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    const user = data.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email missing");
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated successfully", { userId: user.id, email: user.email });

    // Enhanced Stripe key validation
    logStep("Validating Stripe configuration");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      logStep("Available Stripe env vars", Object.keys(Deno.env.toObject()).filter(key => key.includes('STRIPE')));
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    
    if (!stripeKey.startsWith('sk_')) {
      logStep("ERROR: Invalid Stripe key format");
      throw new Error("Invalid STRIPE_SECRET_KEY format");
    }

    logStep("Initializing Stripe client", { keyPrefix: stripeKey.substring(0, 7) + '...' });
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Test Stripe connectivity
    logStep("Testing Stripe connectivity");
    try {
      const testResult = await stripe.customers.list({ limit: 1 });
      logStep("Stripe connectivity successful", { testCount: testResult.data.length });
    } catch (connectError) {
      logStep("ERROR: Stripe connectivity failed", { error: connectError.message });
      throw new Error(`Stripe connection failed: ${connectError.message}`);
    }

    logStep("Parsing request body");
    const requestBody = await req.json();
    const { priceId } = requestBody;
    
    if (!priceId) {
      logStep("ERROR: No priceId provided");
      throw new Error("priceId is required");
    }
    
    logStep("Request validated", { priceId });

    logStep("Searching for existing customer");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found - will create new one");
    }

    // Validate price ID exists before creating session
    logStep("Validating price ID exists");
    try {
      const price = await stripe.prices.retrieve(priceId);
      logStep("Price validation successful", { 
        priceId,
        amount: price.unit_amount,
        currency: price.currency,
        product: price.product
      });
    } catch (priceError) {
      logStep("ERROR: Price ID validation failed", { priceId, error: priceError.message });
      throw new Error(`Price ID ${priceId} not found in Stripe`);
    }

    // Determine application domain for URLs
    const origin = req.headers.get("origin");
    let baseUrl = 'https://app.lovable.dev';
    
    if (origin) {
      // Check if it's a Lovable app domain
      if (origin.includes('.lovable.app') || origin.includes('.lovable.dev')) {
        baseUrl = origin;
      } else if (origin.includes('localhost')) {
        baseUrl = origin;
      }
    }
    
    const successUrl = `${baseUrl}/dashboard?payment=success`;
    const cancelUrl = `${baseUrl}/dashboard/plans?payment=cancelled`;
    
    logStep("Creating checkout session", { 
      priceId, 
      customerId: customerId || 'new',
      successUrl,
      cancelUrl,
      baseUrl
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        user_email: user.email
      }
    });

    logStep("Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      customerId: session.customer 
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    logStep("CRITICAL ERROR in create-checkout", { 
      message: errorMessage,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        stack: errorStack,
        type: error instanceof Error ? error.constructor.name : typeof error
      } : undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});