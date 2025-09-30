import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { user_id, deleted_by } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🗑️ Iniciando exclusão do usuário: ${user_id}`);

    // Get user info for audit
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, store_name')
      .eq('id', user_id)
      .single();

    const { data: authUser } = await supabaseClient.auth.admin.getUserById(user_id);

    // Count data before deletion
    const { count: productsCount } = await supabaseClient
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    const { count: categoriesCount } = await supabaseClient
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    const { count: leadsCount } = await supabaseClient
      .from('catalog_leads')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', user_id);

    // Delete in order respecting foreign keys
    console.log('📊 Deletando analytics_events...');
    await supabaseClient.from('analytics_events').delete().eq('store_id', user_id);
    
    console.log('📦 Deletando products...');
    await supabaseClient.from('products').delete().eq('user_id', user_id);
    
    console.log('🗂️ Deletando categories...');
    await supabaseClient.from('categories').delete().eq('user_id', user_id);
    
    console.log('🔗 Deletando custom_links...');
    await supabaseClient.from('custom_links').delete().eq('user_id', user_id);
    
    console.log('💰 Deletando user_subscriptions...');
    await supabaseClient.from('user_subscriptions').delete().eq('user_id', user_id);
    
    console.log('📧 Deletando subscribers...');
    await supabaseClient.from('subscribers').delete().eq('user_id', user_id);
    
    console.log('📋 Deletando catalog_leads...');
    await supabaseClient.from('catalog_leads').delete().eq('store_id', user_id);
    
    console.log('⚙️ Deletando lead_capture_settings...');
    await supabaseClient.from('lead_capture_settings').delete().eq('user_id', user_id);

    // Delete storage files
    console.log('🖼️ Deletando arquivos do storage...');
    const { data: files } = await supabaseClient.storage
      .from('profile-photos')
      .list(user_id);
    
    if (files && files.length > 0) {
      const filePaths = files.map(f => `${user_id}/${f.name}`);
      await supabaseClient.storage.from('profile-photos').remove(filePaths);
    }

    const { data: bgFiles } = await supabaseClient.storage
      .from('background-images')
      .list(user_id);
    
    if (bgFiles && bgFiles.length > 0) {
      const bgFilePaths = bgFiles.map(f => `${user_id}/${f.name}`);
      await supabaseClient.storage.from('background-images').remove(bgFilePaths);
    }

    // Delete profile
    console.log('👤 Deletando profile...');
    await supabaseClient.from('profiles').delete().eq('id', user_id);

    // Delete auth user
    console.log('🔐 Deletando usuário de autenticação...');
    await supabaseClient.auth.admin.deleteUser(user_id);

    // Create audit log
    console.log('📝 Criando log de auditoria...');
    await supabaseClient.from('user_deletion_audit').insert({
      deleted_user_id: user_id,
      deleted_user_email: authUser?.user?.email || 'unknown',
      deleted_user_name: profile?.name || profile?.store_name || 'unknown',
      deleted_by: deleted_by || 'system',
      deletion_reason: 'Manual deletion from Master Dashboard',
      products_count: productsCount || 0,
      categories_count: categoriesCount || 0,
      leads_count: leadsCount || 0,
    });

    console.log(`✅ Usuário ${user_id} deletado com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Usuário deletado com sucesso',
        stats: {
          products: productsCount || 0,
          categories: categoriesCount || 0,
          leads: leadsCount || 0,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro ao deletar usuário:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});