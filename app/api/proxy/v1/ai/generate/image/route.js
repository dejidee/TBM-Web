import { makeProxyHandlers } from "@/lib/proxy";
import { API_URL } from "@/lib/env";

// A more specific sibling of /api/proxy/v1/[...path] — Next.js matches this
// literal route ahead of that catch-all. Split out so this endpoint can carry
// its own maxDuration without raising the limit (and cost) for every other
// proxied call. Image generation is documented as taking 60-90s; 120s gives
// margin and is well inside the 300s Hobby ceiling under Fluid Compute (the
// default since 2026 — confirm it's on for this project in Settings →
// Functions).
export const maxDuration = 120;

const { POST } = makeProxyHandlers(API_URL, {
  tokenCookies: ["authToken", "vendorAuthToken"],
});

export { POST };
