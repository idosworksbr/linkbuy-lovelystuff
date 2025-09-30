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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all users
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        store_name,
        store_url,
        subscription_plan,
        subscription_expires_at,
        created_at,
        updated_at,
        whatsapp_number,
        instagram_url
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate CSV
    const headers = [
      'ID',
      'Nome',
      'Nome da Loja',
      'URL da Loja',
      'Plano',
      'Expira em',
      'Cadastrado em',
      'Última Atualização',
      'WhatsApp',
      'Instagram'
    ];

    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.name || ''}"`,
        `"${user.store_name || ''}"`,
        user.store_url || '',
        user.subscription_plan || 'free',
        user.subscription_expires_at || '',
        new Date(user.created_at).toLocaleDateString('pt-BR'),
        new Date(user.updated_at).toLocaleDateString('pt-BR'),
        user.whatsapp_number || '',
        user.instagram_url || ''
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    return new Response(
      csvContent,
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      }
    );

  } catch (error) {
    console.error('Error in export-users:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})