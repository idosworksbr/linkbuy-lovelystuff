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

    // Get request body with userId and master token
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DELETE-USER-BY-MASTER] Starting deletion for user:', userId);

    // Get user info for audit log
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, store_name')
      .eq('id', userId)
      .single();

    const { data: authUser } = await supabaseClient.auth.admin.getUserById(userId);

    // Count resources before deletion
    const { count: productsCount } = await supabaseClient
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: categoriesCount } = await supabaseClient
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: leadsCount } = await supabaseClient
      .from('catalog_leads')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', userId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Get user's active subscriptions and cancel them
    const { data: subscriptions } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (subscriptions && subscriptions.length > 0) {
      console.log('[DELETE-USER-BY-MASTER] Canceling active subscriptions:', subscriptions.length);
      
      for (const sub of subscriptions) {
        if (sub.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(sub.stripe_subscription_id, {
              invoice_now: true,
              prorate: true
            });
            console.log('[DELETE-USER-BY-MASTER] Canceled Stripe subscription:', sub.stripe_subscription_id);
          } catch (error) {
            console.error('[DELETE-USER-BY-MASTER] Error canceling Stripe subscription:', error);
          }
        }
      }
    }

    // Delete user data in order (respecting foreign keys)
    console.log('[DELETE-USER-BY-MASTER] Deleting user data...');

    // 1. Delete analytics events
    await supabaseClient
      .from('analytics_events')
      .delete()
      .eq('store_id', userId);

    // 2. Delete catalog leads
    await supabaseClient
      .from('catalog_leads')
      .delete()
      .eq('store_id', userId);

    // 3. Delete product analytics
    const { data: products } = await supabaseClient
      .from('products')
      .select('id')
      .eq('user_id', userId);

    if (products) {
      for (const product of products) {
        await supabaseClient
          .from('product_analytics')
          .delete()
          .eq('product_id', product.id);
      }
    }

    // 4. Delete products
    await supabaseClient
      .from('products')
      .delete()
      .eq('user_id', userId);

    // 5. Delete categories
    await supabaseClient
      .from('categories')
      .delete()
      .eq('user_id', userId);

    // 6. Delete custom links
    await supabaseClient
      .from('custom_links')
      .delete()
      .eq('user_id', userId);

    // 7. Delete lead capture settings
    await supabaseClient
      .from('lead_capture_settings')
      .delete()
      .eq('user_id', userId);

    // 8. Delete subscriptions records
    await supabaseClient
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);

    await supabaseClient
      .from('subscribers')
      .delete()
      .eq('user_id', userId);

    // 9. Delete storage files
    const { data: profilePhotos } = await supabaseClient
      .storage
      .from('profile-photos')
      .list(userId);

    if (profilePhotos && profilePhotos.length > 0) {
      const filesToDelete = profilePhotos.map(file => `${userId}/${file.name}`);
      await supabaseClient
        .storage
        .from('profile-photos')
        .remove(filesToDelete);
    }

    const { data: backgroundImages } = await supabaseClient
      .storage
      .from('background-images')
      .list(userId);

    if (backgroundImages && backgroundImages.length > 0) {
      const filesToDelete = backgroundImages.map(file => `${userId}/${file.name}`);
      await supabaseClient
        .storage
        .from('background-images')
        .remove(filesToDelete);
    }

    // 10. Create audit log entry
    await supabaseClient
      .from('user_deletion_audit')
      .insert({
        deleted_user_id: userId,
        deleted_user_name: profile?.name || 'Unknown',
        deleted_user_email: authUser?.user?.email || 'Unknown',
        deleted_by: 'master',
        products_count: productsCount || 0,
        categories_count: categoriesCount || 0,
        leads_count: leadsCount || 0,
        deletion_reason: 'Deleted by master admin'
      });

    // 11. Delete profile
    await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    // 12. Delete user account (auth.users)
    const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('[DELETE-USER-BY-MASTER] Error deleting user account:', deleteUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DELETE-USER-BY-MASTER] Account deleted successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully',
        deletedResources: {
          products: productsCount || 0,
          categories: categoriesCount || 0,
          leads: leadsCount || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[DELETE-USER-BY-MASTER] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
