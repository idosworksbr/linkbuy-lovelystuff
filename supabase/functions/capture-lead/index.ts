import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { store_id, name, phone, city, source_button, user_agent } = await req.json();

    // Validate required fields
    if (!store_id || !name || !phone || !city || !source_button) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios não preenchidos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Insert lead into database
    const { data, error } = await supabase
      .from('catalog_leads')
      .insert({
        store_id,
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        source_button,
        user_agent,
        ip_address: clientIP
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting lead:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar lead' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Lead captured successfully:', {
      id: data.id,
      store_id,
      name,
      source_button,
      ip_address: clientIP
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: data.id,
        message: 'Lead capturado com sucesso'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in capture-lead:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})