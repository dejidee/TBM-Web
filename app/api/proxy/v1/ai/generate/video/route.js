import { makeProxyHandlers } from "@/lib/proxy";
import { API_URL } from "@/lib/env";

// A more specific sibling of /api/proxy/v1/[...path] — Next.js matches this
// literal route ahead of that catch-all. Split out so this endpoint can carry
// its own maxDuration without raising the limit (and cost) for every other
// proxied call. 300s (5 min) is the Vercel Hobby ceiling under Fluid Compute
// (the default since 2026 — confirm it's on for this project in Settings →
// Functions). Video generation is documented as taking "several minutes",
// which this covers unless a specific request genuinely runs past 5 minutes;
// see BACKLOG.md.
export const maxDuration = 300;

const { POST } = makeProxyHandlers(API_URL, {
  tokenCookies: ["authToken", "vendorAuthToken"],
});

export { POST };
