import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { start_date, end_date } = await req.json();

    console.log('🔄 Calculating conversion funnel...');

    // Step 1: Landing on homepage
    let landingQuery = supabaseClient
      .from('website_sessions')
      .select('session_id, landing_page, user_id');

    if (start_date) landingQuery = landingQuery.gte('start_time', start_date);
    if (end_date) landingQuery = landingQuery.lte('start_time', end_date);

    const { data: landingSessions, error: landingError } = await landingQuery;
    if (landingError) throw landingError;

    const totalLandings = landingSessions?.filter(s => 
      s.landing_page === '/' || s.landing_page?.includes('lovable.app')
    ).length || 0;

    // Step 2: Visited login page
    const { data: loginViews, error: loginError } = await supabaseClient
      .from('page_views')
      .select('session_id')
      .or('page_url.ilike.%/login%,page_url.ilike.%/plans%');

    if (loginError) throw loginError;

    const loginSessions = new Set(loginViews?.map(v => v.session_id));
    const visitedLogin = loginSessions.size;

    // Step 3: Signed up (converted)
    const signups = landingSessions?.filter(s => s.user_id).length || 0;

    // Step 4: Created first product
    const signedUpUsers = landingSessions
      ?.filter(s => s.user_id)
      .map(s => s.user_id) || [];

    let firstProductCount = 0;
    if (signedUpUsers.length > 0) {
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('user_id')
        .in('user_id', signedUpUsers);

      if (!productsError) {
        firstProductCount = new Set(products?.map(p => p.user_id)).size;
      }
    }

    // Step 5: Upgraded to paid plan
    let upgradedCount = 0;
    if (signedUpUsers.length > 0) {
      const { data: subscriptions, error: subsError } = await supabaseClient
        .from('user_subscriptions')
        .select('user_id')
        .in('user_id', signedUpUsers)
        .eq('status', 'active')
        .neq('subscription_type', 'free');

      if (!subsError) {
        upgradedCount = new Set(subscriptions?.map(s => s.user_id)).size;
      }
    }

    // Calculate conversion rates
    const funnelData = [
      {
        step: 'Landing',
        name: 'Visitantes na Página Inicial',
        count: totalLandings,
        percentage: 100,
        drop_off: 0,
      },
      {
        step: 'Login Page',
        name: 'Visitaram Login/Planos',
        count: visitedLogin,
        percentage: totalLandings > 0 ? ((visitedLogin / totalLandings) * 100).toFixed(1) : '0',
        drop_off: totalLandings > 0 ? (((totalLandings - visitedLogin) / totalLandings) * 100).toFixed(1) : '0',
      },
      {
        step: 'Signup',
        name: 'Criaram Conta',
        count: signups,
        percentage: totalLandings > 0 ? ((signups / totalLandings) * 100).toFixed(1) : '0',
        drop_off: visitedLogin > 0 ? (((visitedLogin - signups) / visitedLogin) * 100).toFixed(1) : '0',
      },
      {
        step: 'First Product',
        name: 'Criaram Primeiro Produto',
        count: firstProductCount,
        percentage: totalLandings > 0 ? ((firstProductCount / totalLandings) * 100).toFixed(1) : '0',
        drop_off: signups > 0 ? (((signups - firstProductCount) / signups) * 100).toFixed(1) : '0',
      },
      {
        step: 'Upgrade',
        name: 'Assinaram Plano Pago',
        count: upgradedCount,
        percentage: totalLandings > 0 ? ((upgradedCount / totalLandings) * 100).toFixed(1) : '0',
        drop_off: firstProductCount > 0 ? (((firstProductCount - upgradedCount) / firstProductCount) * 100).toFixed(1) : '0',
      },
    ];

    console.log('✅ Conversion funnel calculated');

    return new Response(
      JSON.stringify({ funnel: funnelData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error calculating conversion funnel:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
