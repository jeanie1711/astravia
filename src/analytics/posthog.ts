import posthog from "posthog-js";

// PostHog (docs/DECISIONS.md, 2026-09-17 -- replaces the Vercel Web
// Analytics custom-events attempt from earlier the same day once we
// found the Hobby plan doesn't expose custom events at all, in the
// dashboard or via any API). Free tier comfortably covers this app's
// traffic. Client-side only, anonymous counts -- no birth details or
// any other personal data is ever attached to an event (CLAUDE.md §14).
let initialized = false;

export function initPostHog(): void {
  if (initialized || typeof window === "undefined") return;
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return;

  posthog.init(apiKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    // Pageviews are captured manually on route change (see
    // PostHogPageview.tsx) since PostHog's own automatic capture only
    // sees the initial load and browser back/forward, not Next.js's
    // client-side router.push() navigations.
    capture_pageview: false,
    // Never creates a full "person" profile for an anonymous visitor
    // (we never call posthog.identify()) -- keeps this the same kind of
    // anonymous, no-accounts counting as the rest of the app (CLAUDE.md
    // §4/§14), and stays clear of the free tier's separate identified-
    // user allowance.
    person_profiles: "identified_only"
  });
  initialized = true;
}

export function trackEvent(name: string): void {
  if (typeof window === "undefined") return;
  posthog.capture(name);
}

export function trackPageview(): void {
  if (typeof window === "undefined") return;
  posthog.capture("$pageview");
}
