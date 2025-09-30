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

    console.log('📊 Fetching extended user data...');

    // Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, store_name, store_url, subscription_plan, subscription_expires_at, created_at, updated_at, whatsapp_number, instagram_url')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Get auth emails
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const emailMap = new Map();
    authUsers?.users.forEach(user => emailMap.set(user.id, user.email));

    // Get counts
    const { data: products } = await supabase.from('products').select('user_id');
    const { data: leads } = await supabase.from('catalog_leads').select('store_id');
    
    const productCounts = new Map();
    products?.forEach(p => productCounts.set(p.user_id, (productCounts.get(p.user_id) || 0) + 1));
    
    const leadCounts = new Map();
    leads?.forEach(l => leadCounts.set(l.store_id, (leadCounts.get(l.store_id) || 0) + 1));

    console.log('✅ Generating CSV...');

    const headers = [
      'ID', 'Nome', 'Email', 'Loja', 'URL', 'Link Catálogo', 'Plano', 'Status',
      'Produtos', 'Leads', 'WhatsApp', 'Instagram', 'Cadastro', 'Expira em'
    ];

    const csvRows = [
      headers.join(','),
      ...profiles!.map(user => {
        const status = user.subscription_expires_at && new Date(user.subscription_expires_at) > new Date() 
          ? 'Ativo' : user.subscription_plan === 'free' ? 'Free' : 'Expirado';
        const catalogUrl = `https://2c91a137-7c80-438f-b79a-b9efe537f989.lovableproject.com/catalog/${user.store_url}`;
        
        return [
          user.id,
          `"${user.name || ''}"`,
          emailMap.get(user.id) || 'N/A',
          `"${user.store_name || ''}"`,
          user.store_url || '',
          catalogUrl,
          user.subscription_plan || 'free',
          status,
          productCounts.get(user.id) || 0,
          leadCounts.get(user.id) || 0,
          user.whatsapp_number || '',
          user.instagram_url || '',
          new Date(user.created_at).toLocaleDateString('pt-BR'),
          user.subscription_expires_at ? new Date(user.subscription_expires_at).toLocaleDateString('pt-BR') : ''
        ].join(',');
      })
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