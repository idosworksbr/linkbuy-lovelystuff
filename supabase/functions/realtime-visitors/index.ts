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

    // Get active sessions (last 5 minutes)
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const { data: activeSessions, error } = await supabaseClient
      .from('website_sessions')
      .select('*')
      .gte('updated_at', fiveMinutesAgo.toISOString())
      .is('end_time', null);

    if (error) throw error;

    // Get recent page views (last minute)
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    const { data: recentViews, error: viewsError } = await supabaseClient
      .from('page_views')
      .select('session_id, page_url, created_at')
      .gte('created_at', oneMinuteAgo.toISOString())
      .order('created_at', { ascending: false });

    if (viewsError) throw viewsError;

    // Count unique active visitors
    const uniqueVisitors = new Set(activeSessions?.map(s => s.session_id) || []).size;

    // Get current pages being viewed
    const currentPages = recentViews?.reduce((acc: any, view: any) => {
      if (!acc[view.page_url]) {
        acc[view.page_url] = 0;
      }
      acc[view.page_url]++;
      return acc;
    }, {});

    return new Response(
      JSON.stringify({ 
        online_visitors: uniqueVisitors,
        active_sessions: activeSessions?.length || 0,
        recent_views: recentViews?.length || 0,
        current_pages: currentPages || {},
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro ao buscar visitantes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});