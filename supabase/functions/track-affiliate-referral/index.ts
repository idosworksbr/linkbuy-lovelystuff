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

    const { affiliate_code, user_id } = await req.json();

    if (!affiliate_code || !user_id) {
      throw new Error('affiliate_code and user_id are required');
    }

    // Find affiliate
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliate_code)
      .eq('status', 'active')
      .single();

    if (affiliateError || !affiliate) {
      throw new Error('Affiliate not found or inactive');
    }

    // Create referral
    const { error: referralError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_id: affiliate.id,
        user_id: user_id
      });

    if (referralError) throw referralError;

    // Update profile
    await supabase
      .from('profiles')
      .update({ referred_by_affiliate_id: affiliate.id })
      .eq('id', user_id);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});