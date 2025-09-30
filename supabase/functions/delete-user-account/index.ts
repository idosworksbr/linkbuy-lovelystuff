import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[DELETE-ACCOUNT] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DELETE-ACCOUNT] User authenticated:', user.id);

    // Get request body with password
    const { password } = await req.json();

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify password by trying to sign in
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: user.email!,
      password: password
    });

    if (signInError) {
      console.error('[DELETE-ACCOUNT] Password verification failed:', signInError);
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DELETE-ACCOUNT] Password verified, starting account deletion...');

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Get user's active subscriptions and cancel them
    const { data: subscriptions } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (subscriptions && subscriptions.length > 0) {
      console.log('[DELETE-ACCOUNT] Canceling active subscriptions:', subscriptions.length);
      
      for (const sub of subscriptions) {
        if (sub.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(sub.stripe_subscription_id, {
              invoice_now: true,
              prorate: true
            });
            console.log('[DELETE-ACCOUNT] Canceled Stripe subscription:', sub.stripe_subscription_id);
          } catch (error) {
            console.error('[DELETE-ACCOUNT] Error canceling Stripe subscription:', error);
          }
        }
      }
    }

    // Delete user data in order (respecting foreign keys)
    console.log('[DELETE-ACCOUNT] Deleting user data...');

    // 1. Delete analytics events
    await supabaseClient
      .from('analytics_events')
      .delete()
      .eq('store_id', user.id);

    // 2. Delete product analytics
    const { data: products } = await supabaseClient
      .from('products')
      .select('id')
      .eq('user_id', user.id);

    if (products) {
      for (const product of products) {
        await supabaseClient
          .from('product_analytics')
          .delete()
          .eq('product_id', product.id);
      }
    }

    // 3. Delete products
    await supabaseClient
      .from('products')
      .delete()
      .eq('user_id', user.id);

    // 4. Delete categories
    await supabaseClient
      .from('categories')
      .delete()
      .eq('user_id', user.id);

    // 5. Delete custom links
    await supabaseClient
      .from('custom_links')
      .delete()
      .eq('user_id', user.id);

    // 6. Delete subscriptions records
    await supabaseClient
      .from('user_subscriptions')
      .delete()
      .eq('user_id', user.id);

    await supabaseClient
      .from('subscribers')
      .delete()
      .eq('user_id', user.id);

    // 7. Delete storage files
    const { data: profilePhotos } = await supabaseClient
      .storage
      .from('profile-photos')
      .list(user.id);

    if (profilePhotos) {
      const filesToDelete = profilePhotos.map(file => `${user.id}/${file.name}`);
      if (filesToDelete.length > 0) {
        await supabaseClient
          .storage
          .from('profile-photos')
          .remove(filesToDelete);
      }
    }

    const { data: backgroundImages } = await supabaseClient
      .storage
      .from('background-images')
      .list(user.id);

    if (backgroundImages) {
      const filesToDelete = backgroundImages.map(file => `${user.id}/${file.name}`);
      if (filesToDelete.length > 0) {
        await supabaseClient
          .storage
          .from('background-images')
          .remove(filesToDelete);
      }
    }

    // 8. Delete profile
    await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', user.id);

    // 9. Delete user account (auth.users)
    const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('[DELETE-ACCOUNT] Error deleting user account:', deleteUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DELETE-ACCOUNT] Account deleted successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[DELETE-ACCOUNT] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});