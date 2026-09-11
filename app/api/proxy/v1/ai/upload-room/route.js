import { makeProxyHandlers } from "@/lib/proxy";
import { API_URL } from "@/lib/env";

// A more specific sibling of /api/proxy/v1/[...path] — Next.js matches this
// literal route ahead of that catch-all. Split out for the same reason as
// generate/image and generate/video: room photos can be up to 10MB, so this
// gets its own headroom without raising the limit for every other proxied
// call.
export const maxDuration = 60;

const { POST } = makeProxyHandlers(API_URL, {
  tokenCookies: ["authToken", "vendorAuthToken"],
});

export { POST };
