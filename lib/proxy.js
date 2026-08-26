/**
 * Central proxy handler factory.
 *
 * Creates Next.js App Router route handlers that transparently forward
 * requests to a backend service.  The actual backend URL lives in a
 * server-side-only env var so it is never shipped to the browser.
 *
 * Security measures:
 *  - Only a safe allow-list of request headers is forwarded (no Host leak).
 *  - Only a safe allow-list of response headers is returned to the client.
 *  - The Authorization header is derived server-side from an httpOnly cookie
 *    and is NOT forwarded from the client. Browser JavaScript never holds a
 *    token, so an XSS cannot read one.
 *  - X-Content-Type-Options is set on every response.
 *  - A 502 is returned when the upstream is unreachable rather than leaking
 *    connection details.
 *  - Response bodies are never logged verbatim; see lib/log.js.
 */

const FORWARDED_REQUEST_HEADERS = [
  "cookie",
  "content-type",
  "accept",
  "accept-language",
  "accept-encoding",
  // A per-booking capability the backend mints for guest consultations
  // (`managementToken` on POST /consultations). It authorises exactly one
  // consultation's read/reschedule/cancel/pay — it is not an identity, so
  // forwarding it does not contradict "auth is derived server-side".
  "x-consultation-token",
];

const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "set-cookie",
];

/**
 * @param {string} backendBase   Full base URL of the upstream service,
 *                               e.g. process.env.API_URL.
 *                               Must be a private (non-NEXT_PUBLIC) env var.
 * @param {object}   [options]
 * @param {string[]} [options.tokenCookies]
 *        httpOnly cookies to source the Bearer token from, in priority order.
 *        Each mount names its own: the admin mount must never authenticate
 *        with a user token, and vice versa.
 */
import { cookies } from "next/headers";
import { isDev, safeBody, safeUrl } from "@/lib/log";

export function makeProxyHandlers(backendBase, { tokenCookies = [] } = {}) {
  async function handle(request, context) {
    const { path } = await context.params;
    const segments = Array.isArray(path) ? path.join("/") : path;

    // Preserve original query string
    const { search } = new URL(request.url);
    const targetUrl = `${backendBase}/${segments}${search}`;


    // Forward only the headers we trust
    const forwardHeaders = new Headers();
    for (const key of FORWARDED_REQUEST_HEADERS) {
      const value = request.headers.get(key);
      if (value) forwardHeaders.set(key, value);
    }

    // The backend requires Authorization: Bearer <token> — cookies alone are not
    // accepted. The token comes from an httpOnly cookie, never from the client's
    // own Authorization header (which is not in the forward allow-list above).
    const cookieStore = await cookies();
    const token = tokenCookies
      .map((name) => cookieStore.get(name)?.value)
      .find(Boolean);
    if (token) forwardHeaders.set("authorization", `Bearer ${token}`);


    const init = {
      method: request.method,
      headers: forwardHeaders,
    };

    // Attach body for non-idempotent methods
    if (!["GET", "HEAD"].includes(request.method)) {
      init.body = await request.arrayBuffer();
    }

    let upstream;
    try {
      upstream = await fetch(targetUrl, init);
    } catch (err) {
      console.error("[proxy] upstream fetch failed:", safeUrl(targetUrl), err.message);
      return new Response(
        JSON.stringify({ error: "Upstream service unavailable" }),
        { status: 502, headers: { "content-type": "application/json" } },
      );
    }

    // Build safe response headers
    const responseHeaders = new Headers();
    for (const key of FORWARDED_RESPONSE_HEADERS) {
      if (key === "set-cookie") continue; // handled separately below
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }

    // Forward Set-Cookie. `.get("set-cookie")` collapses/drops multiple cookies
    // under undici, so use getSetCookie() to retrieve each header intact.
    // Over plain HTTP (local dev) a `Secure` cookie is dropped by the browser,
    // so strip that attribute unless the request actually arrived over HTTPS.
    const proto =
      request.headers.get("x-forwarded-proto") ??
      new URL(request.url).protocol.replace(":", "");
    const isHttps = proto === "https";
    const setCookies =
      typeof upstream.headers.getSetCookie === "function"
        ? upstream.headers.getSetCookie()
        : [upstream.headers.get("set-cookie")].filter(Boolean);
    for (const cookie of setCookies) {
      const value = isHttps
        ? cookie
        : cookie.replace(/;\s*Secure/gi, "");
      responseHeaders.append("set-cookie", value);
    }

    responseHeaders.set("X-Content-Type-Options", "nosniff");

    // Read body so we can log errors without consuming the stream.
    // Bodies are only ever echoed in development, and redacted even there: a
    // success body carries tokens, an error body can carry PII. In production
    // the request line is the whole log entry.
    const body = await upstream.text();
    const line = `[proxy] ${request.method} ${safeUrl(targetUrl)} → ${upstream.status}`;
    if (!upstream.ok) {
      console.error(line, isDev ? safeBody(body) : "");
    } else if (isDev) {
      console.log(line);
    }

    return new Response(body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  return {
    GET: handle,
    POST: handle,
    PUT: handle,
    PATCH: handle,
    DELETE: handle,
  };
}
