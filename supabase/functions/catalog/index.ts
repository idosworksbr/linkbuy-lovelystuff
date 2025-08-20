
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
    console.log('🚀 Inicializando função catalog')
    console.log('📍 URL da requisição:', req.url)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url)
    const storeUrl = url.pathname.split('/').pop()

    console.log('🔍 Store URL extraída:', storeUrl)

    if (!storeUrl || storeUrl === 'catalog') {
      console.log('❌ Store URL inválida')
      return new Response(
        JSON.stringify({ 
          error: 'Store URL is required',
          debug: { storeUrl }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar informações da loja
    console.log('🔍 Buscando informações da loja...')
    const { data: storeData, error: storeError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        store_name,
        store_description,
        profile_photo_url,
        background_color,
        store_url,
        whatsapp_number,
        created_at
      `)
      .eq('store_url', storeUrl)
      .maybeSingle()

    console.log('📊 Resultado da busca da loja:', { storeData, storeError })

    if (storeError) {
      console.log('❌ Erro ao buscar loja:', storeError)
      return new Response(
        JSON.stringify({ 
          error: 'Store lookup failed', 
          details: storeError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!storeData) {
      console.log('❌ Loja não encontrada')
      return new Response(
        JSON.stringify({ error: 'Store not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar produtos da loja
    console.log('🔍 Buscando produtos da loja...')
    const { data: productsData, error: productsError } = await supabaseClient
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        images,
        created_at
      `)
      .eq('user_id', storeData.id)
      .order('created_at', { ascending: false })

    console.log('📊 Resultado da busca de produtos:', { 
      count: productsData?.length, 
      productsError 
    })

    if (productsError) {
      console.log('❌ Erro ao buscar produtos:', productsError)
      return new Response(
        JSON.stringify({ 
          error: 'Products lookup failed', 
          details: productsError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Formatar resposta
    const catalogData = {
      store: {
        id: storeData.id,
        store_name: storeData.store_name,
        store_description: storeData.store_description,
        profile_photo_url: storeData.profile_photo_url,
        background_color: storeData.background_color || '#ffffff',
        store_url: storeData.store_url,
        whatsapp_number: storeData.whatsapp_number ? storeData.whatsapp_number.toString() : null,
        created_at: storeData.created_at
      },
      products: productsData || [],
      meta: {
        total_products: productsData?.length || 0,
        generated_at: new Date().toISOString()
      }
    }

    console.log('✅ Catálogo gerado:', {
      store: catalogData.store.store_name,
      products: catalogData.meta.total_products
    })
    
    return new Response(
      JSON.stringify(catalogData),
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
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
