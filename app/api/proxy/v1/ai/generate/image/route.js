import { makeProxyHandlers } from "@/lib/proxy";
import { API_URL } from "@/lib/env";

// A more specific sibling of /api/proxy/v1/[...path] — Next.js matches this
// literal route ahead of that catch-all. Split out so this endpoint can carry
// its own maxDuration without raising the limit (and cost) for every other
// proxied call. 60s is the Vercel Hobby ceiling; image generation is
// documented as taking 60-90s, so even this is not a guarantee — see
// BACKLOG.md.
export const maxDuration = 60;

const { POST } = makeProxyHandlers(API_URL, {
  tokenCookies: ["authToken", "vendorAuthToken"],
});

export { POST };
