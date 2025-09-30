import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { start_date, end_date } = await req.json();

    console.log('📊 Fetching website analytics from', start_date, 'to', end_date);

    // Build date filter
    let sessionsQuery = supabaseClient
      .from('website_sessions')
      .select('*');

    if (start_date) {
      sessionsQuery = sessionsQuery.gte('start_time', start_date);
    }
    if (end_date) {
      sessionsQuery = sessionsQuery.lte('start_time', end_date);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) throw sessionsError;

    // Calculate metrics
    const totalSessions = sessions?.length || 0;
    const uniqueUsers = new Set(sessions?.map(s => s.ip_address)).size;
    const totalPages = sessions?.reduce((sum, s) => sum + (s.page_count || 0), 0) || 0;
    const totalDuration = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
    const conversions = sessions?.filter(s => s.converted_to_signup).length || 0;
    
    const avgPagesPerSession = totalSessions > 0 ? (totalPages / totalSessions).toFixed(2) : '0';
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
    const conversionRate = totalSessions > 0 ? ((conversions / totalSessions) * 100).toFixed(2) : '0';

    // Calculate bounce rate (sessions with only 1 page view)
    const bounces = sessions?.filter(s => (s.page_count || 0) <= 1).length || 0;
    const bounceRate = totalSessions > 0 ? ((bounces / totalSessions) * 100).toFixed(2) : '0';

    // Traffic sources
    const trafficSources: Record<string, { sessions: number; conversions: number }> = {};
    sessions?.forEach(session => {
      let source = 'Direto';
      
      if (session.utm_source) {
        source = session.utm_source;
      } else if (session.referrer) {
        if (session.referrer.includes('google')) source = 'Google Orgânico';
        else if (session.referrer.includes('facebook')) source = 'Facebook';
        else if (session.referrer.includes('instagram')) source = 'Instagram';
        else if (session.referrer.includes('youtube')) source = 'YouTube';
        else source = 'Referência';
      }

      if (!trafficSources[source]) {
        trafficSources[source] = { sessions: 0, conversions: 0 };
      }
      trafficSources[source].sessions++;
      if (session.converted_to_signup) {
        trafficSources[source].conversions++;
      }
    });

    // Get page views for popular pages
    let pageViewsQuery = supabaseClient
      .from('page_views')
      .select('page_url, page_title, time_on_page_seconds, bounce, created_at');

    if (start_date && end_date) {
      pageViewsQuery = pageViewsQuery
        .gte('created_at', start_date)
        .lte('created_at', end_date);
    }

    const { data: pageViews, error: pageViewsError } = await pageViewsQuery;

    if (pageViewsError) throw pageViewsError;

    // Group pages
    const pageStats: Record<string, { views: number; totalTime: number; bounces: number }> = {};
    pageViews?.forEach(pv => {
      if (!pageStats[pv.page_url]) {
        pageStats[pv.page_url] = { views: 0, totalTime: 0, bounces: 0 };
      }
      pageStats[pv.page_url].views++;
      pageStats[pv.page_url].totalTime += pv.time_on_page_seconds || 0;
      if (pv.bounce) pageStats[pv.page_url].bounces++;
    });

    const popularPages = Object.entries(pageStats)
      .map(([url, stats]) => ({
        url,
        views: stats.views,
        avg_time: stats.views > 0 ? Math.round(stats.totalTime / stats.views) : 0,
        bounce_rate: stats.views > 0 ? ((stats.bounces / stats.views) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Daily sessions for chart (last 30 days)
    const dailySessions: Record<string, number> = {};
    sessions?.forEach(session => {
      const date = new Date(session.start_time).toISOString().split('T')[0];
      dailySessions[date] = (dailySessions[date] || 0) + 1;
    });

    const timelineData = Object.entries(dailySessions)
      .map(([date, count]) => ({ date, sessions: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log('✅ Analytics calculated successfully');

    return new Response(
      JSON.stringify({
        metrics: {
          total_sessions: totalSessions,
          unique_users: uniqueUsers,
          avg_pages_per_session: parseFloat(avgPagesPerSession),
          avg_duration_seconds: avgDuration,
          bounce_rate: parseFloat(bounceRate),
          conversion_rate: parseFloat(conversionRate),
          total_conversions: conversions,
        },
        traffic_sources: Object.entries(trafficSources).map(([source, data]) => ({
          source,
          sessions: data.sessions,
          conversions: data.conversions,
          conversion_rate: data.sessions > 0 ? ((data.conversions / data.sessions) * 100).toFixed(2) : '0',
        })),
        popular_pages: popularPages,
        timeline: timelineData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error fetching website analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
