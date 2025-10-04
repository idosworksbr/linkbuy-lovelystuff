import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { affiliate_id, start_date, end_date } = await req.json();

    // Get referrals
    const { data: referrals } = await supabase
      .from('affiliate_referrals')
      .select('*, user:profiles(subscription_plan)')
      .eq('affiliate_id', affiliate_id);

    // Get commissions
    const query = supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliate_id);

    if (start_date) query.gte('period_start', start_date);
    if (end_date) query.lte('period_end', end_date);

    const { data: commissions } = await query;

    const totalReferrals = referrals?.length || 0;
    const activeSubscriptions = referrals?.filter((r: any) => r.user?.subscription_plan !== 'free').length || 0;
    const totalRevenue = commissions?.reduce((sum: number, c: any) => sum + Number(c.commission_amount), 0) || 0;

    return new Response(
      JSON.stringify({
        totalReferrals,
        activeSubscriptions,
        totalRevenue,
        commissions: commissions || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});