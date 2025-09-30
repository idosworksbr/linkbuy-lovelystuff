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

    console.log('🔍 Verificando configurações de expiração...');

    // Get expiration settings
    const { data: settings } = await supabaseClient
      .from('account_expiration_settings')
      .select('*')
      .single();

    if (!settings?.enabled) {
      console.log('⏸️ Limpeza automática está desabilitada');
      return new Response(
        JSON.stringify({ message: 'Limpeza automática desabilitada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const expirationHours = settings.expiration_hours;
    console.log(`⏱️ Buscando contas não verificadas há mais de ${expirationHours} horas...`);

    // Get unverified users older than expiration time
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - expirationHours);

    // Get auth users who haven't confirmed email
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers();
    
    if (usersError) throw usersError;

    const unverifiedUsers = users?.filter(user => 
      !user.email_confirmed_at && 
      new Date(user.created_at) < expirationDate
    ) || [];

    console.log(`📋 Encontradas ${unverifiedUsers.length} contas não verificadas para deletar`);

    let deletedCount = 0;
    let errors = [];

    for (const user of unverifiedUsers) {
      try {
        console.log(`🗑️ Deletando usuário não verificado: ${user.id} (${user.email})`);

        // Delete related data
        await supabaseClient.from('analytics_events').delete().eq('store_id', user.id);
        await supabaseClient.from('products').delete().eq('user_id', user.id);
        await supabaseClient.from('categories').delete().eq('user_id', user.id);
        await supabaseClient.from('custom_links').delete().eq('user_id', user.id);
        await supabaseClient.from('user_subscriptions').delete().eq('user_id', user.id);
        await supabaseClient.from('subscribers').delete().eq('user_id', user.id);
        await supabaseClient.from('catalog_leads').delete().eq('store_id', user.id);
        await supabaseClient.from('lead_capture_settings').delete().eq('user_id', user.id);

        // Delete storage files
        const { data: files } = await supabaseClient.storage
          .from('profile-photos')
          .list(user.id);
        
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${user.id}/${f.name}`);
          await supabaseClient.storage.from('profile-photos').remove(filePaths);
        }

        // Delete profile
        await supabaseClient.from('profiles').delete().eq('id', user.id);

        // Delete auth user
        await supabaseClient.auth.admin.deleteUser(user.id);

        // Audit log
        await supabaseClient.from('user_deletion_audit').insert({
          deleted_user_id: user.id,
          deleted_user_email: user.email || 'unknown',
          deleted_user_name: 'unverified',
          deleted_by: 'system',
          deletion_reason: `Auto-deleted after ${expirationHours}h without email verification`,
          products_count: 0,
          categories_count: 0,
          leads_count: 0,
        });

        deletedCount++;
        console.log(`✅ Usuário ${user.id} deletado com sucesso`);
      } catch (error: any) {
        console.error(`❌ Erro ao deletar ${user.id}:`, error);
        errors.push({ user_id: user.id, error: error.message });
      }
    }

    console.log(`✅ Limpeza concluída: ${deletedCount} contas deletadas`);

    return new Response(
      JSON.stringify({ 
        success: true,
        deletedCount,
        errors,
        expirationHours
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro na limpeza automática:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});