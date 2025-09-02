import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = "pk_live_51S2cpKFhG2EqaMMarWCOKw3EDm5iwwM7G50tefRYeHUjP18iuSnAsuVovc1drMFdp7BZMoq4GvA1joXvbSLYW8ru00kZN9qEDo";

// Initialize Stripe instance (for future use with Stripe Elements)
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);