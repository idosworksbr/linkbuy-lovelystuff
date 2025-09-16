import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configurações padrão para usuários sem assinatura ativa
const DEFAULT_CATALOG_CONFIG = {
  catalog_theme: 'light',
  catalog_layout: 'bottom',
  product_grid_layout: 'default',
  hide_footer: false,
  background_color: '#ffffff',
  store_description: null, // Ocultar descrição para não assinantes
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

    // Verificar se usuário tem assinatura ativa
    const { data: subscriptionData } = await supabaseClient
      .from('user_subscriptions')
      .select('status, subscription_type, current_period_end')
      .eq('user_id', store.id)
      .eq('status', 'active');

    const hasActiveSubscription = subscriptionData && subscriptionData.length > 0;
    console.log(`🔐 Status da assinatura - User ID: ${store.id}, Ativa: ${hasActiveSubscription}`);
    
    // Se não tem assinatura ativa, aplicar configurações padrão
    let finalStore = { ...store };
    if (!hasActiveSubscription) {
      finalStore = {
        ...store,
        ...DEFAULT_CATALOG_CONFIG,
        // Manter apenas dados básicos obrigatórios
        id: store.id,
        store_name: store.store_name,
        store_url: store.store_url,
        profile_photo_url: store.profile_photo_url,
        whatsapp_number: store.whatsapp_number,
        instagram_url: store.instagram_url,
        custom_whatsapp_message: store.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
        created_at: store.created_at,
      };
    }

    // Get category information
    const { data: categoryData, error: categoryError } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('id', category_id)
      .eq('user_id', finalStore.id)
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

    // Get products for this category - only active products
    const { data: productsData, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('user_id', finalStore.id)
      .eq('category_id', category_id)
      .eq('status', 'active')
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
        ...finalStore,
        // Sempre adicionar créditos se não há assinatura ativa
        show_mylinkbuy_credits: !hasActiveSubscription,
        has_active_subscription: hasActiveSubscription
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