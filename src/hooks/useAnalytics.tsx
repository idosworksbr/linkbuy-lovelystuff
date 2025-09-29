import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

interface StoreAnalytics {
  total_catalog_views: number
  total_product_views: number
  total_whatsapp_clicks: number
  total_instagram_clicks: number
  unique_visitors: number
}

interface ProductAnalytics {
  product_id: string
  product_name: string
  product_image: string
  product_price: number
  total_views: number
  whatsapp_clicks: number
  instagram_clicks: number
  conversion_rate: number
}

export const useAnalytics = (startDate?: Date, endDate?: Date) => {
  const { user } = useAuth()
  const [storeAnalytics, setStoreAnalytics] = useState<StoreAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Validate dates for custom range
    if (startDate && endDate && startDate > endDate) {
      setError('Data inicial deve ser anterior à data final')
      setLoading(false)
      return
    }

    let isMounted = true
    let timeoutId: NodeJS.Timeout

    // Debounce para evitar múltiplas chamadas
    timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase.rpc('get_store_analytics', {
          store_id_param: user.id,
          start_date_param: startDate?.toISOString(),
          end_date_param: endDate?.toISOString()
        })

        if (!isMounted) return

        if (queryError) {
          if (queryError.code === '57014') {
            console.warn('Query timeout - tente um período menor')
            setError('Timeout ao carregar dados. Tente um período menor.')
          } else {
            console.error('Error fetching store analytics:', queryError)
            setError('Erro ao carregar analytics')
          }
          return
        }

        if (data && data.length > 0) {
          setStoreAnalytics({
            total_catalog_views: Number(data[0].total_catalog_views),
            total_product_views: Number(data[0].total_product_views),
            total_whatsapp_clicks: Number(data[0].total_whatsapp_clicks),
            total_instagram_clicks: Number(data[0].total_instagram_clicks),
            unique_visitors: Number(data[0].unique_visitors)
          })
        } else {
          setStoreAnalytics({
            total_catalog_views: 0,
            total_product_views: 0,
            total_whatsapp_clicks: 0,
            total_instagram_clicks: 0,
            unique_visitors: 0
          })
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching analytics:', err)
          setError('Erro ao carregar analytics')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 500) // 500ms debounce

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [user, startDate, endDate])

  return { storeAnalytics, loading, error }
}

export const useProductAnalytics = (startDate?: Date, endDate?: Date) => {
  const { user } = useAuth()
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Validate dates for custom range
    if (startDate && endDate && startDate > endDate) {
      setError('Data inicial deve ser anterior à data final')
      setLoading(false)
      return
    }

    let isMounted = true
    let timeoutId: NodeJS.Timeout

    // Debounce para evitar múltiplas chamadas
    timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase.rpc('get_product_analytics', {
          store_id_param: user.id,
          start_date_param: startDate?.toISOString(),
          end_date_param: endDate?.toISOString()
        })

        if (!isMounted) return

        if (queryError) {
          // Tratamento específico para timeout
          if (queryError.code === '57014') {
            console.warn('Query timeout - tente um período menor')
            setError('Timeout ao carregar dados. Tente um período menor.')
          } else {
            console.error('Error fetching product analytics:', queryError)
            setError('Erro ao carregar analytics de produtos')
          }
          setProductAnalytics([])
          return
        }

        if (data) {
          setProductAnalytics(data.map((item: any) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            product_price: Number(item.product_price),
            total_views: Number(item.total_views),
            whatsapp_clicks: Number(item.whatsapp_clicks),
            instagram_clicks: Number(item.instagram_clicks),
            conversion_rate: Number(item.conversion_rate)
          })))
        } else {
          setProductAnalytics([])
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching product analytics:', err)
          setError('Erro ao carregar analytics de produtos')
          setProductAnalytics([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 500) // 500ms debounce

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [user, startDate, endDate])

  return { productAnalytics, loading, error }
}

// Hook for tracking analytics events from public catalog
export const useAnalyticsTracker = () => {
  const trackEvent = async (
    eventType: 'catalog_view' | 'product_view' | 'whatsapp_click' | 'instagram_click',
    storeId: string,
    productId?: string
  ) => {
    try {
      await supabase.functions.invoke('analytics-tracker', {
        body: {
          event_type: eventType,
          store_id: storeId,
          product_id: productId,
          user_agent: navigator.userAgent,
          referrer: document.referrer
        }
      })
    } catch (error) {
      console.error('Error tracking analytics event:', error)
      // Fail silently to not disrupt user experience
    }
  }

  return { trackEvent }
}