import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Plan prices in cents
const PLAN_PRICES = {
  'pro': 1290,
  'pro_plus': 2580,
  'verified': 1790,
  'pro_plus_verified': 3990
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Fetching admin metrics...');

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total users:', totalUsers);

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());
    
    console.log('✅ Active users:', activeUsers);

    // Get active subscriptions by type
    const { data: activeSubscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('subscription_type, user_id')
      .eq('status', 'active');

    if (subsError) {
      console.error('❌ Error fetching subscriptions:', subsError);
    }

    console.log('💳 Active subscriptions:', activeSubscriptions?.length || 0);

    // Calculate real monthly revenue
    let monthlyRevenue = 0;
    const subscriptionCounts = {
      pro: 0,
      pro_plus: 0,
      verified: 0,
      pro_plus_verified: 0
    };

    if (activeSubscriptions) {
      activeSubscriptions.forEach(sub => {
        const type = sub.subscription_type as keyof typeof PLAN_PRICES;
        if (PLAN_PRICES[type]) {
          monthlyRevenue += PLAN_PRICES[type];
          subscriptionCounts[type]++;
        }
      });
    }

    const annualRevenue = monthlyRevenue * 12;
    const paidUsers = activeSubscriptions?.length || 0;

    console.log('💰 Monthly revenue:', monthlyRevenue / 100, 'R$');

    // Get users with detailed information
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, store_name, store_url, subscription_plan, subscription_expires_at, is_verified, created_at, updated_at, whatsapp_number, instagram_url, phone, last_login_at, first_login_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    }

    // Get emails from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    }

    // Create email map
    const emailMap = new Map();
    authUsers?.users.forEach(user => {
      emailMap.set(user.id, user.email);
    });

    // Get product counts
    const { data: productCounts } = await supabase
      .from('products')
      .select('user_id')
      .then(({ data }) => {
        const counts = new Map();
        data?.forEach(p => {
          counts.set(p.user_id, (counts.get(p.user_id) || 0) + 1);
        });
        return { data: counts };
      });

    // Get lead counts
    const { data: leadCounts } = await supabase
      .from('catalog_leads')
      .select('store_id')
      .then(({ data }) => {
        const counts = new Map();
        data?.forEach(l => {
          counts.set(l.store_id, (counts.get(l.store_id) || 0) + 1);
        });
        return { data: counts };
      });

    // Get traffic source from website_sessions
    const { data: trafficSources } = await supabase
      .from('website_sessions')
      .select('user_id, utm_source, referrer')
      .then(({ data }) => {
        const sources = new Map();
        data?.forEach(session => {
          if (session.user_id && !sources.has(session.user_id)) {
            const source = session.utm_source || 
                           (session.referrer?.includes('google') ? 'Google' :
                            session.referrer?.includes('facebook') ? 'Facebook' :
                            session.referrer?.includes('instagram') ? 'Instagram' :
                            session.referrer ? 'Referral' : 'Direct');
            sources.set(session.user_id, source);
          }
        });
        return { data: sources };
      });

    // Combine all data
    const users = profiles?.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: emailMap.get(profile.id) || 'N/A',
      store_name: profile.store_name,
      store_url: profile.store_url,
      subscription_plan: profile.subscription_plan,
      subscription_expires_at: profile.subscription_expires_at,
      is_verified: profile.is_verified || false,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      product_count: productCounts?.get(profile.id) || 0,
      lead_count: leadCounts?.get(profile.id) || 0,
      whatsapp_number: profile.whatsapp_number,
      instagram_url: profile.instagram_url,
      phone: profile.phone,
      last_login_at: profile.last_login_at,
      first_login_at: profile.first_login_at,
      traffic_source: trafficSources?.get(profile.id) || 'Direct',
      catalog_url: `https://2c91a137-7c80-438f-b79a-b9efe537f989.lovableproject.com/catalog/${profile.store_url}`
    })) || [];

    const metrics = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      paidUsers,
      monthlyRevenue, // in cents
      annualRevenue, // in cents
      subscriptionBreakdown: subscriptionCounts
    };

    console.log('✅ Metrics calculated successfully');

    return new Response(
      JSON.stringify({
        metrics,
        users
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in admin-metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao carregar métricas' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})