import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsEvent {
  event_type: 'catalog_view' | 'product_view' | 'whatsapp_click' | 'instagram_click'
  store_id: string
  product_id?: string
  user_agent?: string
  ip_address?: string
  referrer?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    const { event_type, store_id, product_id, user_agent, referrer }: AnalyticsEvent = await req.json()

    // Validate required fields
    if (!event_type || !store_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event_type, store_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate event_type
    const validEventTypes = ['catalog_view', 'product_view', 'whatsapp_click', 'instagram_click']
    if (!validEventTypes.includes(event_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event_type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for recent duplicate events (throttling)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { data: recentEvents } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_type', event_type)
      .eq('store_id', store_id)
      .eq('ip_address', clientIP)
      .gte('created_at', fiveMinutesAgo)
      .limit(1)

    // Skip if duplicate event from same IP within 5 minutes
    if (recentEvents && recentEvents.length > 0 && event_type === 'catalog_view') {
      return new Response(
        JSON.stringify({ message: 'Event throttled' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert analytics event
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        store_id,
        product_id: product_id || null,
        user_agent: user_agent || req.headers.get('user-agent'),
        ip_address: clientIP,
        referrer: referrer || req.headers.get('referer')
      })

    if (insertError) {
      console.error('Error inserting analytics event:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to track event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Event tracked successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analytics-tracker function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})