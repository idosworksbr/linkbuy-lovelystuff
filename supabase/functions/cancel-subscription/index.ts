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
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

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

    // Get request body for cancel type
    const { cancelImmediately = false } = await req.json();
    logStep("Cancel request", { cancelImmediately });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find the customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found for this user");
    }

    const subscription = subscriptions.data[0];
    logStep("Found active subscription", { subscriptionId: subscription.id });

    // Cancel the subscription
    let canceledSubscription;
    if (cancelImmediately) {
      // Cancel immediately
      canceledSubscription = await stripe.subscriptions.cancel(subscription.id);
      logStep("Subscription canceled immediately", { subscriptionId: subscription.id });
    } else {
      // Cancel at period end
      canceledSubscription = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      logStep("Subscription set to cancel at period end", { 
        subscriptionId: subscription.id,
        currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000)
      });
    }

    // Update the subscribers table
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: !cancelImmediately, // Still subscribed until period end if not immediate
      subscription_tier: cancelImmediately ? null : canceledSubscription.items.data[0]?.price?.nickname || 'pro',
      subscription_end: cancelImmediately ? null : new Date(canceledSubscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database with cancellation info", { 
      canceledImmediately: cancelImmediately,
      subscriptionEnd: canceledSubscription.current_period_end
    });

    return new Response(JSON.stringify({ 
      success: true,
      canceled_immediately: cancelImmediately,
      subscription_end: canceledSubscription.current_period_end ? new Date(canceledSubscription.current_period_end * 1000).toISOString() : null,
      message: cancelImmediately 
        ? "Assinatura cancelada imediatamente" 
        : "Assinatura será cancelada no final do período atual"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});