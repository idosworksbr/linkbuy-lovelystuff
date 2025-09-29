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
    // Usar service role para acessar dados públicos de catálogos
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

    // Check if catalog is visible
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('catalog_visible')
      .eq('store_url', storeUrl)
      .single();

    if (profileData && profileData.catalog_visible === false) {
      console.log('Catalog is hidden for store:', storeUrl);
      return new Response(
        JSON.stringify({ 
          error: 'Catalog not available',
          message: 'Este catálogo está temporariamente indisponível.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Get products efficiently - separate queries for better performance
    // Only show active products in public catalog
    let allProducts = [];
    let productsError = null;
    
    try {
      // First get products without JOIN to avoid timeout
      const { data: productsData, error: pError } = await supabaseClient
        .from('products')
        .select('*')
        .eq('user_id', store.id)
        .eq('status', 'active')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(200); // Add reasonable limit to prevent timeout
      
      if (pError) {
        productsError = pError;
      } else if (productsData && productsData.length > 0) {
        // Get unique category IDs from products
        const categoryIds = [...new Set(productsData
          .filter(p => p.category_id)
          .map(p => p.category_id))];
        
        // Get categories for these products only if needed
        let categoryMap = new Map();
        if (categoryIds.length > 0) {
          const { data: categoryData } = await supabaseClient
            .from('categories')
            .select('id, name, image_url')
            .in('id', categoryIds);
          
          if (categoryData) {
            categoryData.forEach(cat => categoryMap.set(cat.id, cat));
          }
        }
        
        // Combine products with their categories
        allProducts = productsData.map(product => ({
          ...product,
          categories: product.category_id ? categoryMap.get(product.category_id) || null : null
        }));
      }
    } catch (error) {
      console.error('Error in products query:', error);
      productsError = error;
      allProducts = [];
    }
    
    // Always show all products in feed (removed toggle functionality)
    // All products will be shown in the main feed regardless of category

    let feedProducts = allProducts || [];
    // Always show all products - handle display_order conflicts
    const categorizedProducts = (allProducts || []).filter(p => p.category_id);
    const uncategorizedProducts = (allProducts || []).filter(p => !p.category_id);
    
    const maxCategorizedOrder = categorizedProducts.length > 0 
      ? Math.max(...categorizedProducts.map(p => p.display_order || 0))
      : 0;
    
    // Uncategorized products get orders starting from maxCategorizedOrder + 1
    const reorderedUncategorized = uncategorizedProducts.map((product, index) => ({
      ...product,
      display_order: maxCategorizedOrder + index + 1
    }));
    
    feedProducts = [...categorizedProducts, ...reorderedUncategorized]
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    console.log('Total products count:', allProducts?.length || 0);
    console.log('Feed products count:', feedProducts?.length || 0);
    console.log('All products shown in feed (default behavior)');
    console.log('Categories count:', categories.length);

    const response = {
      store: {
        ...store,
        background_color: store.background_color || '#ffffff',
        background_type: store.background_type || 'color',
        background_image_url: store.background_image_url || null,
        hide_footer: store.hide_footer || false,
        is_verified: store.is_verified || false,
        custom_whatsapp_message: store.custom_whatsapp_message || 'Olá! Vi seu catálogo MyLinkBuy e gostaria de saber mais sobre seus produtos.',
        catalog_theme: store.catalog_theme || 'light',
        catalog_layout: store.catalog_layout || 'bottom',  // Fixed: bottom shows title/price visible
        show_all_products_in_feed: true // Always true - removed toggle functionality
      },
      products: feedProducts, // Products for the main feed (filtered)
      allProducts: allProducts || [], // All products for category filtering
      categories,
      customLinks,
      meta: {
        total_products: feedProducts.length,
        total_all_products: allProducts?.length || 0,
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