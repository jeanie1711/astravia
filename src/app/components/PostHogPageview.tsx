"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initPostHog, trackPageview } from "../../analytics/posthog";

// Mounted once in layout.tsx. usePathname() (unlike useSearchParams())
// doesn't require a Suspense boundary, so this stays a plain client
// component -- query strings (e.g. the Dodo return_url's
// ?checkout=success) aren't included in the tracked URL, which is fine
// for page-level funnel counts.
export function PostHogPageview() {
  const pathname = usePathname();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (pathname) trackPageview();
  }, [pathname]);

  return null;
}
