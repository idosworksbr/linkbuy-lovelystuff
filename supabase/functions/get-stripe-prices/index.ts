import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-STRIPE-PRICES] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("Function started - v4");

  try {
    // Enhanced environment validation
    logStep("Checking environment variables");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found in environment");
      logStep("Available env vars", Object.keys(Deno.env.toObject()).filter(key => key.includes('STRIPE')));
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    
    if (!stripeKey.startsWith('sk_')) {
      logStep("ERROR: Invalid Stripe key format");
      throw new Error("Invalid STRIPE_SECRET_KEY format");
    }
    
    logStep("Stripe key validated successfully", { keyPrefix: stripeKey.substring(0, 7) + '...' });

    logStep("Initializing Stripe client");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    logStep("Testing Stripe connectivity");
    // Test Stripe connection first
    try {
      await stripe.customers.list({ limit: 1 });
      logStep("Stripe connectivity test successful");
    } catch (testError) {
      logStep("ERROR: Stripe connectivity test failed", { error: testError.message });
      throw new Error(`Stripe connection failed: ${testError.message}`);
    }

    logStep("Fetching active prices from Stripe");
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
      limit: 100, // Add explicit limit
    });

    logStep("Prices retrieved successfully", { count: prices.data.length });

    // Enhanced price formatting with validation
    const formattedPrices = prices.data.map((price, index) => {
      const formatted = {
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        product_name: (price.product as any)?.name || `Product ${index + 1}`,
      };
      logStep(`Price ${index + 1} formatted`, formatted);
      return formatted;
    });

    logStep("All prices processed successfully", { totalPrices: formattedPrices.length });

    return new Response(JSON.stringify({ prices: formattedPrices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    logStep("CRITICAL ERROR in get-stripe-prices", { 
      message: errorMessage,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    // Return detailed error for debugging
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