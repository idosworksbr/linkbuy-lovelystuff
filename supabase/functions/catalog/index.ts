
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Inicializando função catalog')
    console.log('📍 URL da requisição:', req.url)
    console.log('🔧 Método:', req.method)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const storeUrl = pathParts[pathParts.length - 1]

    console.log('🔍 Partes do path:', pathParts)
    console.log('🏪 Store URL extraída:', storeUrl)

    if (!storeUrl || storeUrl === 'catalog') {
      console.log('❌ Store URL não fornecida ou inválida')
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

    // Buscar informações da loja diretamente na tabela profiles
    console.log('🏪 Buscando informações da loja:', storeUrl)
    const { data: storeInfo, error: storeError } = await supabaseClient
      .from('profiles')
      .select('id, name, store_url, store_name, store_description, profile_photo_url, background_color, created_at')
      .eq('store_url', storeUrl)
      .single()

    console.log('📊 Resultado da busca da loja:', { storeInfo, storeError })

    if (storeError) {
      console.log('❌ Erro ao buscar loja:', storeError)
      return new Response(
        JSON.stringify({ 
          error: 'Store lookup failed', 
          store_url: storeUrl,
          details: storeError.message,
          debug: storeError
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se a loja foi encontrada
    if (!storeInfo) {
      console.log('❌ Loja não encontrada para store_url:', storeUrl)
      return new Response(
        JSON.stringify({ 
          error: 'Store not found', 
          store_url: storeUrl,
          message: 'A loja especificada não existe ou não está ativa',
          debug: {
            searchedUrl: storeUrl,
            functionResult: storeInfo
          }
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Loja encontrada:', {
      id: storeInfo.id,
      store_name: storeInfo.store_name,
      store_url: storeInfo.store_url
    })

    // Buscar produtos da loja
    console.log('📦 Buscando produtos da loja')
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('id, name, description, price, images, created_at')
      .eq('user_id', storeInfo.id)

    console.log('📊 Resultado da busca de produtos:', { 
      productCount: products?.length || 0, 
      productsError 
    })

    if (productsError) {
      console.log('⚠️ Erro ao buscar produtos:', productsError)
      // Mesmo com erro nos produtos, retornamos a loja (pode não ter produtos ainda)
    }

    const productList = products || []
    console.log('📊 Produtos encontrados:', productList.length)

    // Montar resposta otimizada do catálogo
    const catalogData = {
      store: {
        id: storeInfo.id,
        store_name: storeInfo.store_name,
        store_description: storeInfo.store_description,
        profile_photo_url: storeInfo.profile_photo_url,
        background_color: storeInfo.background_color || '#ffffff',
        store_url: storeInfo.store_url,
        whatsapp_number: null, // Por enquanto null até a coluna ser criada
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

    console.log('🚀 Catálogo gerado com sucesso')
    console.log('📋 Resumo:', {
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
