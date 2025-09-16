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
  is_verified: false,
  custom_background_enabled: false,
  background_type: 'color',
  background_color: '#ffffff',
  background_image_url: null,
  store_description: null, // Ocultar descrição para não assinantes
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

    // Verificar se usuário tem assinatura ativa
    const { data: subscriptionData } = await supabaseClient
      .from('user_subscriptions')
      .select('status, subscription_type, current_period_end')
      .eq('user_id', store.id)
      .eq('status', 'active');

    const hasActiveSubscription = subscriptionData && subscriptionData.length > 0;
    
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

    // Get data for this store in parallel
    const [customLinksResult, categoriesResult] = await Promise.all([
      supabaseClient.rpc('get_public_custom_links', { store_url_param: storeUrl }),
      supabaseClient.rpc('get_public_store_categories', { store_url_param: storeUrl })
    ]);

    // Para usuários sem assinatura ativa, ocultar links externos
    let customLinks = customLinksResult.data || [];
    if (!hasActiveSubscription) {
      customLinks = []; // Ocultar todos os links externos
    }

    if (customLinksResult.error) {
      console.error('Error fetching custom links:', customLinksResult.error);
      // Don't fail the request if custom links fail, just continue
    }

    if (categoriesResult.error) {
      console.error('Error fetching categories:', categoriesResult.error);
      // Don't fail the request if categories fail, just continue
    }

    const categories = categoriesResult.data || [];

    // Get all products with category information in a single query to avoid duplicates
    // Only show active products in public catalog
    const { data: allProducts, error: productsError } = await supabaseClient
      .from('products')
      .select(`
        *,
        categories!products_category_id_fkey(id, name, image_url)
      `)
      .eq('user_id', finalStore.id)
      .eq('status', 'active')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    // Filter products based on store's feed configuration
    // Para usuários sem assinatura, sempre usar configuração padrão (não mostrar todos os produtos)
    let feedProducts = allProducts || [];
    if (hasActiveSubscription && store.show_all_products_in_feed) {
      // Show all products in the main feed when enabled AND has active subscription
      feedProducts = allProducts || [];
    } else {
      // Show only products without category in the main feed
      feedProducts = (allProducts || []).filter(product => !product.category_id);
    }

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    console.log('Total products count:', allProducts?.length || 0);
    console.log('Categories count:', categories.length);

    console.log(`Store subscription status - User ID: ${finalStore.id}, Has Active Subscription: ${hasActiveSubscription}`);
    
    const response = {
      store: {
        ...finalStore,
        // Sempre adicionar créditos se não há assinatura ativa
        show_mylinkbuy_credits: !hasActiveSubscription,
        has_active_subscription: hasActiveSubscription
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