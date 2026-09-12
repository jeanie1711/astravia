// Display copy only -- the real charge amount lives on the Product
// created in the Dodo Payments dashboard (see src/payments/dodo.ts).
// Update both places if the price ever changes.
export const PRICE_LABEL = "$2.99";

// sessionStorage key PaywallModal stashes the Dodo checkout session id
// under, right before redirecting to Dodo's hosted checkout page --
// return_url can't carry a value that doesn't exist until after create()
// resolves, so the id travels back with the browser instead of the URL.
export const PENDING_CHECKOUT_STORAGE_KEY = "astravia-pending-checkout";
