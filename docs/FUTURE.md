# Future / Post-MVP Backlog

Captured per CLAUDE.md §4: features outside MVP scope, recorded here only
when the Product Owner asks for backlog capture, not implemented
opportunistically.

---

## Freemium / paywall unlock model

**Captured:** 2026-09-04

**Idea:** Show a small number of results for free (top city + 1-2 more) with
full "Why" detail available for one or two of them to build interest and
convince the user of the app's value. Require a small one-time payment
(low enough to minimize purchase friction, aiming for volume over margin)
to unlock the full "Why" detail for the #1 result and remaining results.

**Explicitly NOT in MVP scope** (conflicts with 01-product-brief.md's
"Explicitly excluded" list: payment, subscriptions, accounts). The MVP's
own success question is about engagement, not monetization validation.

**Why the current architecture should already support this reasonably well
when the time comes:**
- Calculation/scoring/interpretation are fully deterministic given
  (birth input + goal + versions) -- a "locked" result can be recomputed
  identically at unlock time. No need to persist story content anywhere
  before purchase.
- The `/api/calculate` route is stateless; adding an access-check layer
  later is additive, not a rewrite of the calculation pipeline.

**What a real implementation would need (not built now):**
- Some form of purchase/unlock identity -- even a lightweight one (e.g. a
  signed token tied to a Stripe Checkout session) brushes against the
  MVP's current "no accounts" constraint. Needs its own design pass.
- A payment processor integration (Stripe Checkout recommended over
  handling card data directly).
- Terms of service / refund policy; possible business/tax registration
  depending on jurisdiction -- outside engineering scope, needs the
  Product Owner's own follow-up.
- A UI decision for exactly what's gated (full "Why" text only? stars and
  tagline stay visible either way?) and where the paywall prompt sits in
  the flow.

**Implementation guideline being followed now (2026-09-04 UI simplification
pass):** keep a result's rank/position decoupled from how much detail is
rendered for it, so gating a specific rank later is a UI-level condition,
not a data-model change.
