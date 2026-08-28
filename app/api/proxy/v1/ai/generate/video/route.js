import { makeProxyHandlers } from "@/lib/proxy";
import { API_URL } from "@/lib/env";

// A more specific sibling of /api/proxy/v1/[...path] — Next.js matches this
// literal route ahead of that catch-all. Split out so this endpoint can carry
// its own maxDuration without raising the limit (and cost) for every other
// proxied call. 60s is the Vercel Hobby ceiling — video generation is
// documented as taking "several minutes", which this cannot cover. A Pro
// plan (up to 300s, more with Fluid Compute) is required for video
// generation to reliably finish through this proxy; see BACKLOG.md.
export const maxDuration = 60;

const { POST } = makeProxyHandlers(API_URL, {
  tokenCookies: ["authToken", "vendorAuthToken"],
});

export { POST };
