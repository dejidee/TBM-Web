import { redirect } from "next/navigation";

/**
 * The creation flow moved out of the dashboard shell to /ziora/studio, which
 * has no navbar, sidebar, or footer — see app/ziora/studio/layout.jsx.
 *
 * This stub stays because the old path is in users' history and in links we
 * have already shipped. It is a redirect rather than a `next.config` rewrite so
 * it lives next to the route it replaces and disappears with it.
 */
export default function LegacyNewDesignPage() {
  redirect("/ziora/studio");
}
