import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackingEvent {
  session_id: string;
  page_url: string;
  page_title?: string;
  referrer?: string;
  landing_page?: string;
  user_agent?: string;
  ip_address?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  time_on_page?: number;
  user_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const eventData: TrackingEvent = await req.json();
    
    // Extract IP address from request
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';

    console.log('📊 Tracking website event:', eventData.page_url);

    // Check if session exists
    const { data: existingSession, error: sessionCheckError } = await supabaseClient
      .from('website_sessions')
      .select('*')
      .eq('session_id', eventData.session_id)
      .maybeSingle();

    if (sessionCheckError) {
      console.error('Error checking session:', sessionCheckError);
    }

    if (existingSession) {
      // Update existing session
      const updates: any = {
        page_count: (existingSession.page_count || 0) + 1,
        updated_at: new Date().toISOString(),
      };

      // If user_id is provided and not already set
      if (eventData.user_id && !existingSession.user_id) {
        updates.user_id = eventData.user_id;
        updates.converted_to_signup = true;
        console.log('🎯 User signed up! Marking conversion.');
      }

      // Calculate duration if time_on_page provided
      if (eventData.time_on_page) {
        updates.duration_seconds = (existingSession.duration_seconds || 0) + eventData.time_on_page;
      }

      const { error: updateError } = await supabaseClient
        .from('website_sessions')
        .update(updates)
        .eq('session_id', eventData.session_id);

      if (updateError) {
        console.error('Error updating session:', updateError);
        throw updateError;
      }

      console.log('✅ Session updated:', eventData.session_id);
    } else {
      // Create new session
      const sessionData = {
        session_id: eventData.session_id,
        ip_address,
        user_agent: eventData.user_agent || req.headers.get('user-agent'),
        referrer: eventData.referrer,
        landing_page: eventData.landing_page || eventData.page_url,
        utm_source: eventData.utm_source,
        utm_medium: eventData.utm_medium,
        utm_campaign: eventData.utm_campaign,
        utm_content: eventData.utm_content,
        utm_term: eventData.utm_term,
        page_count: 1,
        duration_seconds: 0,
        converted_to_signup: !!eventData.user_id,
        user_id: eventData.user_id || null,
      };

      const { error: insertError } = await supabaseClient
        .from('website_sessions')
        .insert([sessionData]);

      if (insertError) {
        console.error('Error creating session:', insertError);
        throw insertError;
      }

      console.log('✅ New session created:', eventData.session_id);
    }

    // Record page view
    const pageViewData = {
      session_id: eventData.session_id,
      page_url: eventData.page_url,
      page_title: eventData.page_title,
      referrer_page: eventData.referrer,
      time_on_page_seconds: eventData.time_on_page || 0,
      bounce: !existingSession, // First page is potential bounce
    };

    const { error: pageViewError } = await supabaseClient
      .from('page_views')
      .insert([pageViewData]);

    if (pageViewError) {
      console.error('Error recording page view:', pageViewError);
      throw pageViewError;
    }

    return new Response(
      JSON.stringify({ success: true, session_id: eventData.session_id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error tracking website event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
