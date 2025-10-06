import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AffiliateData {
  name: string;
  email: string;
  phone?: string;
  affiliate_code: string;
  affiliate_url: string;
  commission_rate: number;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify master token
    const token = authHeader.replace('Bearer ', '');
    const { data: masterData, error: masterError } = await supabase.functions.invoke(
      'verify-master-token',
      {
        body: { token }
      }
    );

    if (masterError || !masterData?.valid) {
      throw new Error('Invalid master token');
    }

    const { action, affiliate, id } = await req.json();

    let result;
    
    switch (action) {
      case 'create':
        const { data: createData, error: createError } = await supabase
          .from('affiliates')
          .insert(affiliate as AffiliateData)
          .select()
          .single();
        
        if (createError) throw createError;
        result = createData;
        break;

      case 'update':
        const { data: updateData, error: updateError } = await supabase
          .from('affiliates')
          .update(affiliate as Partial<AffiliateData>)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        result = updateData;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('affiliates')
          .delete()
          .eq('id', id);
        
        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error managing affiliate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
