import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_STORAGE_KEY = 'website_session_id';

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useWebsiteTracker = () => {
  const pageStartTime = useRef<number>(Date.now());
  const sessionId = useRef<string>('');

  useEffect(() => {
    // Get or create session ID
    let storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSessionId) {
      storedSessionId = generateUUID();
      localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
    }
    sessionId.current = storedSessionId;

    // Extract UTM parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
    };

    // Track page view
    const trackPageView = async () => {
      try {
        await supabase.functions.invoke('website-tracker', {
          body: {
            session_id: sessionId.current,
            page_url: window.location.pathname,
            page_title: document.title,
            referrer: document.referrer || undefined,
            landing_page: window.location.pathname,
            user_agent: navigator.userAgent,
            ...utmParams,
          },
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();

    // Track page exit
    const trackPageExit = async () => {
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      
      try {
        await supabase.functions.invoke('website-tracker', {
          body: {
            session_id: sessionId.current,
            page_url: window.location.pathname,
            page_title: document.title,
            time_on_page: timeOnPage,
          },
        });
      } catch (error) {
        console.error('Error tracking page exit:', error);
      }
    };

    // Track on page unload
    window.addEventListener('beforeunload', trackPageExit);

    return () => {
      window.removeEventListener('beforeunload', trackPageExit);
    };
  }, []);

  // Function to track conversion (signup)
  const trackConversion = async (userId: string) => {
    try {
      await supabase.functions.invoke('website-tracker', {
        body: {
          session_id: sessionId.current,
          page_url: window.location.pathname,
          user_id: userId,
        },
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  };

  return { trackConversion };
};
