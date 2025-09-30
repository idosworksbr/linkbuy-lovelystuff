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
    const { email, password } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get master user from database
    const { data: master, error } = await supabase
      .from('masters')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !master) {
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // In a real app, you would verify the password hash
    // For now, we'll use a simple comparison (not secure for production)
    const isPasswordValid = await verifyPassword(password, master.password_hash);

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate a simple token (in production, use proper JWT)
    const token = btoa(`${master.id}:${Date.now()}`);

    return new Response(
      JSON.stringify({
        token,
        master: {
          id: master.id,
          email: master.email,
          name: master.name,
          role: master.role
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in master-login:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

// Simple password verification (use bcrypt in production)
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // For demo purposes, store password as simple hash
  // In production, use proper bcrypt verification
  const simpleHash = btoa(password);
  return simpleHash === hash;
}