import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// For backward compatibility
export const stripe = {
  get instance() {
    return getStripe();
  },
};

export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID;

export const SUBSCRIPTION_FEATURES = {
  free: {
    chatsPerWeek: 5,
    savedVehicles: 0,
    maintenanceTracking: false,
    notifications: false,
    adFree: false,
    visualizer3D: false,
    buildShowcase: false,
  },
  premium: {
    chatsPerWeek: Infinity,
    savedVehicles: 10,
    maintenanceTracking: true,
    notifications: true,
    adFree: true,
    visualizer3D: true,
    buildShowcase: true,
  },
} as const;
