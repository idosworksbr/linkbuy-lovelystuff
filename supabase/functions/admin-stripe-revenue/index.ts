import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('💳 Fetching Stripe revenue data...');

    // Get all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    console.log('📊 Active subscriptions found:', subscriptions.data.length);

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    subscriptions.data.forEach((sub: any) => {
      if (sub.items.data[0]?.price?.unit_amount) {
        mrr += sub.items.data[0].price.unit_amount;
      }
    });

    const arr = mrr * 12; // Annual Recurring Revenue

    // Get recent successful charges (last 30 days)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const charges = await stripe.charges.list({
      created: { gte: thirtyDaysAgo },
      limit: 50,
    });

    const successfulCharges = charges.data.filter((charge: any) => charge.status === 'succeeded');

    // Calculate lifetime revenue
    const lifetimeRevenue = successfulCharges.reduce((sum: number, charge: any) => sum + charge.amount, 0);

    // Get recent transactions
    const recentTransactions = successfulCharges.slice(0, 10).map((charge: any) => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      customer_email: charge.billing_details?.email || 'N/A',
      status: charge.status,
      created: new Date(charge.created * 1000).toISOString(),
      description: charge.description || 'Subscription payment',
    }));

    // Calculate subscription breakdown
    const subscriptionBreakdown = {
      pro: 0,
      pro_plus: 0,
      verified: 0,
      pro_plus_verified: 0,
    };

    subscriptions.data.forEach((sub: any) => {
      const priceId = sub.items.data[0]?.price?.id;
      
      // Map Stripe price IDs to plan types
      if (priceId === 'price_1S2k58FhG2EqaMMaAifmR8iL') {
        subscriptionBreakdown.pro++;
      } else if (priceId === 'price_1S2k55FhG2EqaMMaNHnafbQR') {
        subscriptionBreakdown.pro_plus++;
      } else if (priceId === 'price_1S2k51FhG2EqaMMaJqiDgzMI') {
        subscriptionBreakdown.verified++;
      } else if (priceId === 'price_1S2k54FhG2EqaMMa5PNk8gfV') {
        subscriptionBreakdown.pro_plus_verified++;
      }
    });

    // Calculate churn rate (canceled subscriptions in last 30 days)
    const canceledSubscriptions = await stripe.subscriptions.list({
      status: 'canceled',
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });

    const totalActiveAndCanceled = subscriptions.data.length + canceledSubscriptions.data.length;
    const churnRate = totalActiveAndCanceled > 0 
      ? (canceledSubscriptions.data.length / totalActiveAndCanceled) * 100 
      : 0;

    console.log('✅ Stripe revenue data calculated successfully');

    return new Response(
      JSON.stringify({
        mrr, // in cents
        arr, // in cents
        lifetimeRevenue, // in cents (last 30 days)
        totalActiveSubscriptions: subscriptions.data.length,
        subscriptionBreakdown,
        recentTransactions,
        churnRate: parseFloat(churnRate.toFixed(2)),
        totalCanceledLast30Days: canceledSubscriptions.data.length,
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Error in admin-stripe-revenue:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Erro ao buscar dados do Stripe' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
