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
    // Usar service role para acesso público aos dados do catálogo
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        }
      }
    )

    const { store_url, category_id } = await req.json();

    if (!store_url || !category_id) {
      return new Response(
        JSON.stringify({ error: 'Store URL and category ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching category products for:', { store_url, category_id });

    // Get store information
    const { data: storeData, error: storeError } = await supabaseClient
      .rpc('get_public_store_info', { store_url_param: store_url });

    if (storeError || !storeData || storeData.length === 0) {
      console.error('Store not found:', storeError);
      return new Response(
        JSON.stringify({ 
          error: 'Store not found',
          message: `A loja "${store_url}" não foi encontrada.`
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const store = storeData[0];

    // Get category information
    const { data: categoryData, error: categoryError } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('id', category_id)
      .eq('user_id', store.id)
      .eq('is_active', true)
      .single();

    if (categoryError || !categoryData) {
      console.error('Category not found:', categoryError);
      return new Response(
        JSON.stringify({ 
          error: 'Category not found',
          message: 'A categoria não foi encontrada ou não está ativa.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get products for this category
    const { data: productsData, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('user_id', store.id)
      .eq('category_id', category_id)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch products' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const products = productsData || [];

    const response = {
      store: {
        ...store,
        background_color: store.background_color || '#ffffff',
        background_type: store.background_type || 'color',
        background_image_url: store.background_image_url || null,
        hide_footer: store.hide_footer || false,
        catalog_theme: store.catalog_theme || 'light',
        product_grid_layout: store.product_grid_layout || 'default'
      },
      category: categoryData,
      products,
      meta: {
        total_products: products.length,
        generated_at: new Date().toISOString()
      }
    };

    console.log('Returning category products response:', {
      store_name: store.store_name,
      category_name: categoryData.name,
      products_count: products.length
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Erro interno do servidor. Tente novamente.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})