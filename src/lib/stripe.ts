import { loadStripe } from '@stripe/stripe-js';
import { 
  STRIPE_SECURE_CONFIG, 
  getPriceIdByPlan, 
  mapPriceIdToPlanName, 
  getStripePublishableKey 
} from './stripeConfig';

// Re-exportar configurações seguras
export const STRIPE_CONFIG = STRIPE_SECURE_CONFIG;
export { getPriceIdByPlan, mapPriceIdToPlanName };

// Initialize Stripe instance de forma segura
export const stripePromise = (() => {
  const publishableKey = getStripePublishableKey();
  
  if (!publishableKey) {
    console.error('❌ Não foi possível inicializar Stripe: chave pública não encontrada');
    return Promise.resolve(null);
  }
  
  console.log('✅ Stripe inicializado com chave:', publishableKey.substring(0, 12) + '...');
  return loadStripe(publishableKey);
})();