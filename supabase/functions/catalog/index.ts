
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

    console.log('Buscando catálogo para store_url:', storeUrl)

    if (!storeUrl) {
      console.log('Store URL não fornecida')
      return new Response(
        JSON.stringify({ error: 'Store URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar perfil da loja pela store_url usando função segura
    console.log('Buscando perfil com store_url:', storeUrl)
    const { data: profile, error: profileError } = await supabaseClient
      .rpc('get_public_store_info', { store_url_param: storeUrl })
      .single()

    if (profileError) {
      console.log('Erro ao buscar perfil:', profileError)
    }

    if (profileError || !profile) {
      console.log('Loja não encontrada para store_url:', storeUrl)
      return new Response(
        JSON.stringify({ error: 'Store not found', store_url: storeUrl }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Perfil encontrado:', profile.store_name)

    // Buscar produtos da loja
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.log('Erro ao buscar produtos:', productsError)
      throw productsError
    }

    console.log('Produtos encontrados:', products?.length || 0)

    const catalogData = {
      store: profile,
      products: products || []
    }

    return new Response(
      JSON.stringify(catalogData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro interno:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
