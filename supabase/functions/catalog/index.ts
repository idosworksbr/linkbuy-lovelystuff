
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url)
    const storeUrl = url.pathname.split('/').pop()

    console.log('🔍 Buscando catálogo para store_url:', storeUrl)

    if (!storeUrl) {
      console.log('❌ Store URL não fornecida')
      return new Response(
        JSON.stringify({ error: 'Store URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar informações da loja usando função segura
    console.log('🏪 Buscando informações da loja:', storeUrl)
    const { data: storeInfo, error: storeError } = await supabaseClient
      .rpc('get_public_store_info', { store_url_param: storeUrl })

    if (storeError) {
      console.log('❌ Erro ao buscar loja:', storeError)
      return new Response(
        JSON.stringify({ 
          error: 'Store not found', 
          store_url: storeUrl,
          details: storeError.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se a loja foi encontrada
    if (!storeInfo || storeInfo.length === 0) {
      console.log('❌ Loja não encontrada para store_url:', storeUrl)
      return new Response(
        JSON.stringify({ 
          error: 'Store not found', 
          store_url: storeUrl,
          message: 'A loja especificada não existe ou não está ativa'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const store = storeInfo[0]
    console.log('✅ Loja encontrada:', store.store_name)

    // Buscar produtos da loja usando função segura
    console.log('📦 Buscando produtos da loja')
    const { data: products, error: productsError } = await supabaseClient
      .rpc('get_public_store_products', { store_url_param: storeUrl })

    if (productsError) {
      console.log('⚠️ Erro ao buscar produtos:', productsError)
      // Mesmo com erro nos produtos, retornamos a loja (pode não ter produtos ainda)
    }

    const productList = products || []
    console.log('📊 Produtos encontrados:', productList.length)

    // Montar resposta otimizada do catálogo
    const catalogData = {
      store: {
        id: store.id,
        store_name: store.store_name,
        store_description: store.store_description,
        profile_photo_url: store.profile_photo_url,
        background_color: store.background_color || '#ffffff',
        store_url: store.store_url,
        created_at: store.created_at
      },
      products: productList.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images || [],
        created_at: product.created_at
      })),
      meta: {
        total_products: productList.length,
        generated_at: new Date().toISOString()
      }
    }

    console.log('🚀 Catálogo gerado com sucesso')
    
    return new Response(
      JSON.stringify(catalogData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=600' // Cache por 5-10 minutos
        } 
      }
    )

  } catch (error) {
    console.error('💥 Erro interno:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'Erro interno do servidor. Tente novamente em alguns instantes.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
