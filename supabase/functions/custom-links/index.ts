import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CustomLink {
  id?: string;
  title: string;
  url: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/');
    const linkId = pathParts.length > 3 ? pathParts[pathParts.length - 1] : null;
    const isRootPath = pathParts[pathParts.length - 1] === 'custom-links';

    console.log('Request details:', { method, pathname: url.pathname, linkId, isRootPath });

    // GET /custom-links - Get all custom links for the authenticated user
    if (method === 'GET' && isRootPath) {
      console.log('Fetching custom links for user:', user.id);
      
      const { data, error } = await supabaseClient
        .from('custom_links')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching custom links:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch custom links', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Found custom links:', data?.length || 0);
      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /custom-links - Create a new custom link
    if (method === 'POST' && isRootPath) {
      const body = await req.json() as CustomLink;
      
      if (!body.title || !body.url) {
        return new Response(
          JSON.stringify({ error: 'Title and URL are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('custom_links')
        .insert([{
          user_id: user.id,
          title: body.title,
          url: body.url,
          icon: body.icon || 'ExternalLink',
          display_order: body.display_order || 0,
          is_active: body.is_active !== undefined ? body.is_active : true,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating custom link:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create custom link' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /custom-links/:id - Update a custom link
    if (method === 'PUT' && linkId) {
      const body = await req.json() as CustomLink;

      const { data, error } = await supabaseClient
        .from('custom_links')
        .update({
          title: body.title,
          url: body.url,
          icon: body.icon,
          display_order: body.display_order,
          is_active: body.is_active,
        })
        .eq('id', linkId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating custom link:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update custom link' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /custom-links/:id - Delete a custom link
    if (method === 'DELETE' && linkId) {
      const { error } = await supabaseClient
        .from('custom_links')
        .delete()
        .eq('id', linkId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting custom link:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete custom link' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Custom link deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('No matching route found:', { method, pathname: url.pathname, linkId, isRootPath });
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed', 
        details: `${method} ${url.pathname} not supported`,
        debug: { method, linkId, isRootPath }
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})