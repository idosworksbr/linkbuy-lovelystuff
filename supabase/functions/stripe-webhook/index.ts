import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map Stripe price IDs to subscription types
const mapPriceIdToSubscriptionType = (priceId: string): string => {
  const priceMap: { [key: string]: string } = {
    'price_1S2k58FhG2EqaMMaAifmR8iL': 'pro',             // PLANO PRO
    'price_1S2k55FhG2EqaMMaNHnafbQR': 'pro_plus',        // PLANO PRO+
    'price_1S2k51FhG2EqaMMaJqiDgzMI': 'verified',        // SELO VERIFICADO AVULSO
    'price_1S2k54FhG2EqaMMa5PNk8gfV': 'pro_plus_verified' // PLANO PRO+ VERIFICADO
  };
  
  return priceMap[priceId] || 'pro';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method, url: req.url });

    // Validate environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      logStep("ERROR: Missing required environment variables");
      throw new Error('Missing required environment variables');
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Verify webhook signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      logStep("ERROR: Missing Stripe signature");
      throw new Error('Missing Stripe signature');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type, eventId: event.id });
    } catch (err: any) {
      logStep("ERROR: Webhook signature verification failed", { error: err.message });
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe, supabase);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, stripe, supabase);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, stripe, supabase);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, stripe, supabase);
        break;
      
      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR in webhook processing", { 
      message: error.message,
      stack: error.stack 
    });
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session, 
  stripe: Stripe, 
  supabase: any
) {
  logStep("Processing checkout.session.completed", { 
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription
  });

  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionUpdate(subscription, stripe, supabase);
  }
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription, 
  stripe: Stripe, 
  supabase: any
) {
  logStep("Processing subscription update", { 
    subscriptionId: subscription.id,
    status: subscription.status,
    customerId: subscription.customer
  });

  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;
  
  if (!customerEmail) {
    logStep("ERROR: Customer email not found", { customerId: subscription.customer });
    return;
  }

  // Find user by email
  const { data: userData } = await supabase.auth.admin.listUsers();
  const user = userData.users.find((u: any) => u.email === customerEmail);
  
  if (!user) {
    logStep("ERROR: User not found", { email: customerEmail });
    return;
  }

  if (subscription.status === 'active') {
    const priceId = subscription.items.data[0].price.id;
    const subscriptionType = mapPriceIdToSubscriptionType(priceId);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();

    logStep("Upserting active subscription", {
      userId: user.id,
      subscriptionType,
      subscriptionId: subscription.id
    });

    // Upsert subscription
    await supabase.from('user_subscriptions').upsert({
      user_id: user.id,
      subscription_type: subscriptionType,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: 'active',
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,subscription_type',
      ignoreDuplicates: false
    });
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  logStep("Processing subscription deletion", { 
    subscriptionId: subscription.id,
    customerId: subscription.customer
  });

  // Mark subscription as expired
  await supabase
    .from('user_subscriptions')
    .update({ status: 'expired' })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  stripe: Stripe,
  supabase: any
) {
  logStep("Processing successful payment", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription
  });

  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await handleSubscriptionUpdate(subscription, stripe, supabase);
  }
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  stripe: Stripe,
  supabase: any
) {
  logStep("Processing failed payment", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    attemptCount: invoice.attempt_count
  });

  // Could implement logic to handle failed payments
  // For now, just log the event
}