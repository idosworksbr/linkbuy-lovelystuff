import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CommissionData {
  user_id: string;
  subscription_type: string;
  amount: number;
  period_start: string;
  period_end: string;
  subscription_id: string;
  plan_type: string;
}

// Map subscription prices
const SUBSCRIPTION_PRICES: { [key: string]: number } = {
  'pro': 29.90,
  'pro_plus': 49.90,
  'verified': 19.90,
  'pro_plus_verified': 69.80
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      user_id, 
      subscription_type, 
      amount, 
      period_start, 
      period_end, 
      subscription_id,
      plan_type 
    }: CommissionData = await req.json();

    console.log('📊 Processing commission for user:', user_id);

    // Check if user was referred by an affiliate
    const { data: profile } = await supabase
      .from('profiles')
      .select('referred_by_affiliate_id')
      .eq('id', user_id)
      .single();

    if (!profile?.referred_by_affiliate_id) {
      console.log('⚠️ User was not referred by affiliate');
      return new Response(
        JSON.stringify({ message: 'User was not referred by affiliate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const affiliateId = profile.referred_by_affiliate_id;

    // Get affiliate commission rate
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('commission_rate, status')
      .eq('id', affiliateId)
      .single();

    if (!affiliate || affiliate.status !== 'active') {
      console.log('⚠️ Affiliate not found or inactive');
      return new Response(
        JSON.stringify({ message: 'Affiliate not found or inactive' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate commission
    const commissionRate = affiliate.commission_rate / 100;
    const commissionAmount = amount * commissionRate;

    console.log('💰 Commission calculation:', {
      amount,
      rate: affiliate.commission_rate,
      commission: commissionAmount
    });

    // Check if commission already exists for this period
    const { data: existingCommission } = await supabase
      .from('affiliate_commissions')
      .select('id')
      .eq('affiliate_id', affiliateId)
      .eq('referral_id', user_id)
      .eq('subscription_id', subscription_id)
      .eq('period_start', period_start)
      .maybeSingle();

    if (existingCommission) {
      console.log('⚠️ Commission already exists for this period');
      return new Response(
        JSON.stringify({ message: 'Commission already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create commission record
    const { error: commissionError } = await supabase
      .from('affiliate_commissions')
      .insert({
        affiliate_id: affiliateId,
        referral_id: user_id,
        subscription_id,
        plan_type,
        amount,
        commission_amount: commissionAmount,
        period_start,
        period_end,
        status: 'pending'
      });

    if (commissionError) throw commissionError;

    // Update referral first_purchase_at if this is the first purchase
    const { data: referral } = await supabase
      .from('affiliate_referrals')
      .select('first_purchase_at')
      .eq('affiliate_id', affiliateId)
      .eq('user_id', user_id)
      .maybeSingle();

    if (referral && !referral.first_purchase_at) {
      await supabase
        .from('affiliate_referrals')
        .update({ first_purchase_at: new Date().toISOString() })
        .eq('affiliate_id', affiliateId)
        .eq('user_id', user_id);
      
      console.log('✅ Updated first purchase date for referral');
    }

    console.log('✅ Commission created successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        commission_amount: commissionAmount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error processing commission:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
