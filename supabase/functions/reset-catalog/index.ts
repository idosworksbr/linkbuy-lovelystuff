import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[RESET-CATALOG] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[RESET-CATALOG] User authenticated:', user.id);

    // Get request body with password
    const { password } = await req.json();

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: user.email!,
      password: password
    });

    if (signInError) {
      console.error('[RESET-CATALOG] Password verification failed:', signInError);
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[RESET-CATALOG] Password verified, resetting catalog...');

    // Delete catalog data (but keep profile and subscriptions)
    
    // 1. Delete analytics events
    await supabaseClient
      .from('analytics_events')
      .delete()
      .eq('store_id', user.id);

    console.log('[RESET-CATALOG] Analytics events deleted');

    // 2. Delete product analytics
    const { data: products } = await supabaseClient
      .from('products')
      .select('id, images')
      .eq('user_id', user.id);

    if (products) {
      for (const product of products) {
        await supabaseClient
          .from('product_analytics')
          .delete()
          .eq('product_id', product.id);
      }
    }

    console.log('[RESET-CATALOG] Product analytics deleted');

    // 3. Delete products (images are stored as URLs, so no storage cleanup needed)
    await supabaseClient
      .from('products')
      .delete()
      .eq('user_id', user.id);

    console.log('[RESET-CATALOG] Products deleted');

    // 4. Delete categories
    await supabaseClient
      .from('categories')
      .delete()
      .eq('user_id', user.id);

    console.log('[RESET-CATALOG] Categories deleted');

    // 5. Delete custom links
    await supabaseClient
      .from('custom_links')
      .delete()
      .eq('user_id', user.id);

    console.log('[RESET-CATALOG] Custom links deleted');

    // 6. Delete store analytics
    await supabaseClient
      .from('store_analytics')
      .delete()
      .eq('store_id', user.id);

    console.log('[RESET-CATALOG] Store analytics deleted');

    console.log('[RESET-CATALOG] Catalog reset successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Catalog reset successfully',
        deleted: {
          products: products?.length || 0,
          categories: true,
          custom_links: true,
          analytics: true
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[RESET-CATALOG] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
