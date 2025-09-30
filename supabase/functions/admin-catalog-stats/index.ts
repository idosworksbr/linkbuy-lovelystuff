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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('📊 Fetching catalog statistics...');

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total categories
    const { count: totalCategories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    // Get total custom links
    const { count: totalCustomLinks } = await supabase
      .from('custom_links')
      .select('*', { count: 'exact', head: true });

    // Get total leads captured
    const { count: totalLeads } = await supabase
      .from('catalog_leads')
      .select('*', { count: 'exact', head: true });

    // Get total users for averages
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Calculate averages
    const avgProductsPerUser = totalUsers && totalUsers > 0 
      ? parseFloat((totalProducts! / totalUsers).toFixed(2))
      : 0;
    
    const avgLeadsPerStore = totalUsers && totalUsers > 0
      ? parseFloat((totalLeads! / totalUsers).toFixed(2))
      : 0;

    // Get top active stores (by product count)
    const { data: productsByStore } = await supabase
      .from('products')
      .select('user_id');

    const productCounts = new Map<string, number>();
    productsByStore?.forEach(p => {
      productCounts.set(p.user_id, (productCounts.get(p.user_id) || 0) + 1);
    });

    // Get top stores by leads
    const { data: leadsByStore } = await supabase
      .from('catalog_leads')
      .select('store_id');

    const leadCounts = new Map<string, number>();
    leadsByStore?.forEach(l => {
      leadCounts.set(l.store_id, (leadCounts.get(l.store_id) || 0) + 1);
    });

    // Get store details for top stores
    const topStoreIds = [...new Set([
      ...Array.from(productCounts.keys()).slice(0, 10),
      ...Array.from(leadCounts.keys()).slice(0, 10)
    ])];

    const { data: storeProfiles } = await supabase
      .from('profiles')
      .select('id, name, store_name, store_url, subscription_plan')
      .in('id', topStoreIds);

    const storeMap = new Map();
    storeProfiles?.forEach(store => {
      storeMap.set(store.id, store);
    });

    // Build top stores arrays
    const topActiveStores = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({
        ...storeMap.get(userId),
        product_count: count,
        lead_count: leadCounts.get(userId) || 0,
      }))
      .filter(store => store.id); // Filter out any undefined stores

    const topLeadStores = Array.from(leadCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({
        ...storeMap.get(userId),
        lead_count: count,
        product_count: productCounts.get(userId) || 0,
      }))
      .filter(store => store.id);

    // Get analytics totals
    const { count: totalCatalogViews } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'catalog_view');

    const { count: totalProductViews } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'product_view');

    const { count: totalWhatsAppClicks } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'whatsapp_click');

    console.log('✅ Catalog statistics calculated successfully');

    return new Response(
      JSON.stringify({
        totalProducts: totalProducts || 0,
        totalCategories: totalCategories || 0,
        totalCustomLinks: totalCustomLinks || 0,
        totalLeads: totalLeads || 0,
        totalUsers: totalUsers || 0,
        avgProductsPerUser,
        avgLeadsPerStore,
        topActiveStores,
        topLeadStores,
        analytics: {
          totalCatalogViews: totalCatalogViews || 0,
          totalProductViews: totalProductViews || 0,
          totalWhatsAppClicks: totalWhatsAppClicks || 0,
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in admin-catalog-stats:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao carregar estatísticas' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
