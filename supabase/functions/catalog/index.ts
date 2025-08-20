
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  console.log('🚀 Catalog function iniciada')
  console.log('📍 Request URL:', req.url)
  console.log('🔧 Method:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo OPTIONS request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const storeUrl = pathParts[pathParts.length - 1]

    console.log('🔍 Path parts:', pathParts)
    console.log('🏪 Extracted store URL:', storeUrl)

    if (!storeUrl || storeUrl === 'catalog') {
      console.log('❌ Store URL não fornecida')
      return new Response(
        JSON.stringify({ 
          error: 'Store URL is required',
          debug: {
            pathname: url.pathname,
            pathParts: pathParts
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // NOVA ABORDAGEM: Vamos fazer múltiplas tentativas de busca
    console.log('🏪 Tentando encontrar loja:', storeUrl)
    
    // Primeira tentativa: busca exata
    let { data: storeInfo, error: storeError } = await supabaseClient
      .from('profiles')
      .select('id, name, store_url, store_name, store_description, profile_photo_url, background_color, created_at')
      .eq('store_url', storeUrl)
      .maybeSingle()

    console.log('📊 Primeira busca - Store query result:', { storeInfo, storeError })

    // Se não encontrou, vamos tentar busca case-insensitive
    if (!storeInfo && !storeError) {
      console.log('🔍 Tentando busca case-insensitive')
      const result = await supabaseClient
        .from('profiles')
        .select('id, name, store_url, store_name, store_description, profile_photo_url, background_color, created_at')
        .ilike('store_url', storeUrl)
        .maybeSingle()
      
      storeInfo = result.data
      storeError = result.error
      console.log('📊 Segunda busca - Store query result:', { storeInfo, storeError })
    }

    // Se ainda não encontrou, vamos listar todas as lojas para debug
    if (!storeInfo && !storeError) {
      console.log('🔍 Listando todas as lojas para debug')
      const { data: allStores, error: listError } = await supabaseClient
        .from('profiles')
        .select('store_url')
        .limit(10)
      
      console.log('📊 Todas as lojas:', allStores)
      console.log('📊 Error ao listar:', listError)
    }

    if (storeError) {
      console.log('❌ Error fetching store:', storeError)
      return new Response(
        JSON.stringify({ 
          error: 'Store lookup failed', 
          store_url: storeUrl,
          details: storeError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!storeInfo) {
      console.log('❌ Store not found:', storeUrl)
      return new Response(
        JSON.stringify({ 
          error: 'Store not found', 
          store_url: storeUrl,
          message: 'A loja especificada não existe'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Store found:', {
      id: storeInfo.id,
      store_name: storeInfo.store_name,
      store_url: storeInfo.store_url
    })

    // Buscar produtos
    console.log('📦 Fetching products for user_id:', storeInfo.id)
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('id, name, description, price, images, created_at')
      .eq('user_id', storeInfo.id)
      .order('created_at', { ascending: false })

    console.log('📊 Products query result:', { 
      productCount: products?.length || 0, 
      productsError 
    })

    if (productsError) {
      console.log('⚠️ Error fetching products:', productsError)
    }

    const productList = products || []
    console.log('📊 Final product count:', productList.length)

    // Preparar resposta
    const catalogData = {
      store: {
        id: storeInfo.id,
        store_name: storeInfo.store_name,
        store_description: storeInfo.store_description,
        profile_photo_url: storeInfo.profile_photo_url,
        background_color: storeInfo.background_color || '#ffffff',
        store_url: storeInfo.store_url,
        whatsapp_number: null,
        created_at: storeInfo.created_at
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

    console.log('🚀 Catalog generated successfully')
    console.log('📋 Summary:', {
      store_name: catalogData.store.store_name,
      product_count: catalogData.products.length,
      store_url: catalogData.store.store_url
    })
    
    return new Response(
      JSON.stringify(catalogData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=600'
        } 
      }
    )

  } catch (error) {
    console.error('💥 Internal error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'Erro interno do servidor',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
