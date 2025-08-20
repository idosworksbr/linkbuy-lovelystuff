
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
    console.log('🚀 Inicializando função product-detail (pública)')
    console.log('📍 URL da requisição:', req.url)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const storeUrl = pathParts[pathParts.length - 2]
    const productId = pathParts[pathParts.length - 1]

    console.log('🔍 Parâmetros extraídos:', { storeUrl, productId })

    if (!storeUrl || !productId || storeUrl === 'product-detail') {
      console.log('❌ Parâmetros inválidos')
      return new Response(
        JSON.stringify({ 
          error: 'Store URL and Product ID are required',
          debug: { storeUrl, productId }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar produto específico junto com dados da loja usando SERVICE_ROLE_KEY
    console.log('🔍 Buscando produto e loja...')
    const { data: productData, error: productError } = await supabaseClient
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        images,
        created_at,
        profiles!inner (
          store_name,
          whatsapp_number,
          store_url
        )
      `)
      .eq('id', productId)
      .eq('profiles.store_url', storeUrl)
      .maybeSingle()

    console.log('📊 Resultado da busca:', { productData, productError })

    if (productError) {
      console.log('❌ Erro ao buscar produto:', productError)
      return new Response(
        JSON.stringify({ 
          error: 'Product lookup failed', 
          details: productError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!productData) {
      console.log('❌ Produto não encontrado')
      return new Response(
        JSON.stringify({ 
          error: 'Product not found',
          message: 'O produto especificado não existe ou não pertence a esta loja'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Formatar resposta
    const productDetail = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      images: productData.images || [],
      created_at: productData.created_at,
      store: {
        store_name: productData.profiles.store_name,
        whatsapp_number: productData.profiles.whatsapp_number ? productData.profiles.whatsapp_number.toString() : null
      }
    }

    console.log('✅ Produto encontrado:', productDetail.name)
    
    return new Response(
      JSON.stringify(productDetail),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        } 
      }
    )

  } catch (error) {
    console.error('💥 Erro interno:', error)
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
