import DodoPayments from "dodopayments";

// The only file that talks to the Dodo Payments SDK directly -- kept
// small so a later provider swap touches this file, not the checkout UI
// or the API routes that call it. Switched from Stripe here (see
// docs/DECISIONS.md, 2026-09-13 entry) because Stripe doesn't support
// merchant accounts registered in Vietnam; Dodo Payments' merchant-of-
// record model does.
//
// Unlike Stripe's inline price_data, a Dodo checkout session only takes
// a product_id + quantity -- the actual $2.99 price lives on the Product
// created in the Dodo dashboard (DODO_PAYMENTS_PRODUCT_ID below). If the
// price changes, update it there AND src/config/payments.ts's
// PRICE_LABEL (display copy only, not the real charge amount).
//
// return_url has no way to carry the not-yet-created session id (create()
// is what generates it), and Dodo's docs only document query params being
// appended on redirect for the separate Payment Links feature, not
// Checkout Sessions -- so this doesn't rely on that. Instead the caller
// (PaywallModal) stashes the session id returned here in sessionStorage
// right before redirecting, and reads it back after Dodo returns to a
// plain, fixed return_url. Verification itself (checkoutSessions.retrieve)
// is still a live server-side call to Dodo, never the redirect alone.
function getClient(): DodoPayments {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) throw new Error("DODO_PAYMENTS_API_KEY is not set");
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
  return new DodoPayments({ bearerToken, environment });
}

function getProductId(): string {
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
  if (!productId) throw new Error("DODO_PAYMENTS_PRODUCT_ID is not set");
  return productId;
}

export async function createCheckoutSession(
  returnOrigin: string,
  returnPath: string
): Promise<{ url: string; sessionId: string }> {
  const client = getClient();
  const session = await client.checkoutSessions.create({
    product_cart: [{ product_id: getProductId(), quantity: 1 }],
    // No birth details or results ever travel to Dodo (CLAUDE.md §14) --
    // this is a generic one-line-item purchase with no personal metadata.
    return_url: `${returnOrigin}${returnPath}?checkout=success`,
    cancel_url: `${returnOrigin}${returnPath}?checkout=cancel`
  });

  if (!session.checkout_url) throw new Error("Dodo Payments did not return a checkout URL");
  return { url: session.checkout_url, sessionId: session.session_id };
}

export async function verifyCheckoutSession(sessionId: string): Promise<{ paid: boolean }> {
  const client = getClient();
  const status = await client.checkoutSessions.retrieve(sessionId);
  return { paid: status.payment_status === "succeeded" };
}
