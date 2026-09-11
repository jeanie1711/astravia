import Stripe from "stripe";
import { PRICE_USD_CENTS, PRODUCT_DESCRIPTION, PRODUCT_NAME } from "../config/payments";

// The only file that talks to the Stripe SDK directly -- kept small so a
// later switch to a merchant-of-record provider (Lemon Squeezy, Paddle)
// for cross-border payout reasons touches this file, not the checkout
// UI or the API routes that call it.
function getClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function createCheckoutSession(returnOrigin: string, returnPath: string): Promise<{ url: string }> {
  const stripe = getClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: PRICE_USD_CENTS,
          product_data: { name: PRODUCT_NAME, description: PRODUCT_DESCRIPTION }
        },
        quantity: 1
      }
    ],
    // No birth details or results ever travel to Stripe (CLAUDE.md §14) --
    // this is a generic one-line-item purchase with no personal metadata.
    success_url: `${returnOrigin}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnOrigin}${returnPath}?checkout=cancel`
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { url: session.url };
}

export async function verifyCheckoutSession(sessionId: string): Promise<{ paid: boolean }> {
  const stripe = getClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return { paid: session.payment_status === "paid" };
}
