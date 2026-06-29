import { STRIPE_SECRET_KEY } from '$env/static/private';

/** Stripe SDK wrapper — scaffold until checkout is wired. */
export function getStripe() {
	if (!STRIPE_SECRET_KEY) {
		throw new Error('STRIPE_SECRET_KEY is not configured');
	}

	// Install `stripe` and return `new Stripe(STRIPE_SECRET_KEY)` when implementing billing.
	throw new Error('Stripe integration not implemented yet');
}
