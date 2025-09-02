
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url);
    const storeUrl = url.pathname.split('/').pop();

    if (!storeUrl) {
      return new Response(
        JSON.stringify({ error: 'Store URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get store information
    const { data: storeData, error: storeError } = await supabaseClient
      .rpc('get_public_store_info', { store_url_param: storeUrl });

    if (storeError || !storeData || storeData.length === 0) {
      console.error('Store not found:', storeError);
      return new Response(
        JSON.stringify({ 
          error: 'Store not found',
          message: `A loja "${storeUrl}" não foi encontrada. Verifique se a URL está correta.`
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const store = storeData[0];

    // Get data for this store in parallel
    const [customLinksResult, categoriesResult] = await Promise.all([
      supabaseClient.rpc('get_public_custom_links', { store_url_param: storeUrl }),
      supabaseClient.rpc('get_public_store_categories', { store_url_param: storeUrl })
    ]);

    if (customLinksResult.error) {
      console.error('Error fetching custom links:', customLinksResult.error);
      // Don't fail the request if custom links fail, just continue
    }

    if (categoriesResult.error) {
      console.error('Error fetching categories:', categoriesResult.error);
      // Don't fail the request if categories fail, just continue
    }

    const customLinks = customLinksResult.data || [];
    const categories = categoriesResult.data || [];

    // Get detailed products with category information
    const { data: productsWithCategories, error: productsWithCategoriesError } = await supabaseClient
      .from('products')
      .select(`
        *,
        categories(id, name, image_url)
      `)
      .eq('user_id', store.id)
      .order('created_at', { ascending: false });

    // Also get products without categories
    const { data: uncategorizedProducts, error: uncategorizedError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('user_id', store.id)
      .is('category_id', null)
      .order('created_at', { ascending: false });

    if (productsWithCategoriesError) {
      console.error('Error fetching products with categories:', productsWithCategoriesError);
    }

    if (uncategorizedError) {
      console.error('Error fetching uncategorized products:', uncategorizedError);
    }

    // Combine all products
    const allProducts = [
      ...(productsWithCategories || []),
      ...(uncategorizedProducts || [])
    ];

    console.log('Products with categories count:', productsWithCategories?.length || 0);
    console.log('Uncategorized products count:', uncategorizedProducts?.length || 0);
    console.log('Total products count:', allProducts.length);
    console.log('Categories count:', categories.length);

    const response = {
      store: {
        ...store,
        background_color: store.background_color || '#ffffff',
        background_type: store.background_type || 'color',
        background_image_url: store.background_image_url || null,
        hide_footer: store.hide_footer || false,
        is_verified: store.is_verified || false,
        custom_whatsapp_message: store.custom_whatsapp_message || 'Olá! Vi seu catálogo LinkBuy e gostaria de saber mais sobre seus produtos.',
        catalog_theme: store.catalog_theme || 'light',
        catalog_layout: store.catalog_layout || 'bottom'  // Fixed: bottom shows title/price visible
      },
      products: allProducts,
      categories,
      customLinks,
      meta: {
        total_products: allProducts.length,
        total_custom_links: customLinks.length,
        total_categories: categories.length,
        generated_at: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
