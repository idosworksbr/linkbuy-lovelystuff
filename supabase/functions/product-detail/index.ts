
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configurações padrão para usuários sem assinatura ativa
const DEFAULT_CATALOG_CONFIG = {
  catalog_theme: 'light',
  catalog_layout: 'bottom',
  hide_footer: false,
  background_color: '#ffffff',
  store_description: null, // Ocultar descrição para não assinantes
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Inicializando função product-detail')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { store_url, product_id } = await req.json()

    console.log('📍 Parâmetros recebidos:', { store_url, product_id })

    if (!store_url || !product_id) {
      console.log('❌ Parâmetros obrigatórios não fornecidos')
      return new Response(
        JSON.stringify({ 
          error: 'store_url and product_id are required',
          debug: { store_url, product_id }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar informações da loja
    console.log('🏪 Buscando informações da loja:', store_url)
    const { data: storeInfo, error: storeError } = await supabaseClient
      .rpc('get_public_store_info', { store_url_param: store_url })

    if (storeError || !storeInfo || storeInfo.length === 0) {
      console.log('❌ Loja não encontrada:', storeError)
      return new Response(
        JSON.stringify({ 
          error: 'Store not found', 
          store_url,
          details: storeError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const store = storeInfo[0]
    console.log('✅ Loja encontrada:', store.store_name)

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

    // Buscar produto específico - somente produtos ativos
    console.log('📦 Buscando produto específico:', product_id)
    const { data: productData, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('user_id', finalStore.id)
      .eq('status', 'active')
      .single()

    if (productError || !productData) {
      console.log('❌ Produto não encontrado:', productError)
      return new Response(
        JSON.stringify({ 
          error: 'Product not found', 
          product_id,
          details: productError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Produto encontrado:', productData.name)

    // Montar resposta com dados do produto e da loja
    const productDetail = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      discount: productData.discount,
      discount_animation_enabled: productData.discount_animation_enabled,
      discount_animation_color: productData.discount_animation_color,
      images: productData.images || [],
      created_at: productData.created_at,
      store: {
        id: finalStore.id,
        store_name: finalStore.store_name,
        store_description: finalStore.store_description,
        profile_photo_url: finalStore.profile_photo_url,
        background_color: finalStore.background_color || '#ffffff',
        store_url: finalStore.store_url,
        whatsapp_number: finalStore.whatsapp_number,
        custom_whatsapp_message: finalStore.custom_whatsapp_message || 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.',
        instagram_url: finalStore.instagram_url,
        catalog_theme: finalStore.catalog_theme || 'light',
        catalog_layout: finalStore.catalog_layout || 'overlay',
        hide_footer: finalStore.hide_footer ?? false,
        show_mylinkbuy_credits: !hasActiveSubscription,
        has_active_subscription: hasActiveSubscription,
      }
    }

    console.log('🚀 Detalhes do produto gerados com sucesso')
    
    return new Response(
      JSON.stringify(productDetail),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=600'
        } 
      }
    )

  } catch (error) {
    console.error('💥 Erro interno:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'Erro interno do servidor. Tente novamente em alguns instantes.',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
