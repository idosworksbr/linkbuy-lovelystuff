import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());

    // Get paid users
    const { count: paidUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('subscription_plan', 'free');

    // Get users with details
    const { data: users } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email:auth.users(email),
        store_name,
        subscription_plan,
        created_at,
        subscription_expires_at
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    // Calculate revenue (placeholder - integrate with actual payment data)
    const monthlyRevenue = (paidUsers || 0) * 2900; // Assuming average plan price
    const annualRevenue = monthlyRevenue * 12;

    const metrics = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      paidUsers: paidUsers || 0,
      monthlyRevenue,
      annualRevenue
    };

    return new Response(
      JSON.stringify({
        metrics,
        users: users || []
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in admin-metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao carregar métricas' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})