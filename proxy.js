import { NextResponse } from "next/server";

/**
 * Edge route protection.
 *
 * Next.js 16 renamed this file convention from `middleware` to `proxy`. It is
 * unrelated to lib/proxy.js, which is the backend API passthrough.
 *
 * Until now these route trees were served to anyone who asked and protection
 * was left to client-side redirects, so the admin and vendor shells shipped to
 * unauthenticated visitors before any check ran.
 *
 * This is a gate, not an authorisation decision: the signature is verified by
 * the backend on every data call, and lib/proxy.js only ever attaches a token
 * it reads from an httpOnly cookie. Here we just refuse to render a private
 * shell to a request that plainly has no session.
 */
// `login` is where a session-less visitor is sent; `open` lists paths inside the
// tree that must stay reachable without one. Vendors sign in through /sign-in —
// /vendor/login is only a stub that forwards there — so send them there directly
// rather than bouncing through two redirects.
const RULES = [
  {
    prefix: "/admin",
    cookie: "adminAuthToken",
    refresh: "adminRefreshToken",
    login: "/admin/login",
    open: ["/admin/login"],
  },
  {
    prefix: "/vendor",
    cookie: "vendorAuthToken",
    refresh: "vendorRefreshToken",
    login: "/sign-in",
    open: ["/vendor/login"],
  },
  {
    prefix: "/dashboard",
    cookie: "authToken",
    refresh: "refreshToken",
    login: "/sign-in",
    open: [],
  },
  // The Ziora studio sits outside /dashboard so it can drop the shell, but it
  // is the same private surface and needs the same gate. Only /ziora/studio —
  // the rest of /ziora is the public marketing and pricing page.
  {
    prefix: "/ziora/studio",
    cookie: "authToken",
    refresh: "refreshToken",
    login: "/sign-in",
    open: [],
  },
];

/** Decode a JWT's exp claim. Signature is NOT checked — the backend does that. */
function isExpired(token) {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof json.exp === "number" && json.exp * 1000 <= Date.now();
  } catch {
    return true; // unparseable — treat as no session
  }
}

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // Site-wide lock: when the public gate is down, no route renders — not just
  // "/". A visitor (or a bot, or a bookmark into /admin/login) gets the same
  // curtain regardless of what they asked for. This runs before, and takes
  // priority over, the auth rules below: while the gate is down even a valid
  // admin session can't reach its own login or dashboard.
  if (
    process.env.NEXT_PUBLIC_SITE_LIVE !== "true" &&
    pathname !== "/site-locked"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/site-locked";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  const rule = RULES.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  );
  if (!rule || rule.open.includes(pathname)) return NextResponse.next();

  const token = request.cookies.get(rule.cookie)?.value;
  const refresh = request.cookies.get(rule.refresh)?.value;

  // An expired access token is fine if a refresh token is present — the session
  // route will silently renew it. Only a missing token is a hard no.
  if (token && (!isExpired(token) || refresh)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = rule.login;
  url.search = "";
  url.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  // Broad on purpose: the site-wide lock above has to see every route, not
  // just the previously-gated prefixes. Excludes only what the /site-locked
  // page itself needs to render (its JS/CSS chunks) and the favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
