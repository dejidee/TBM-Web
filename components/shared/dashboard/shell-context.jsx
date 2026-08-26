// components/shared/dashboard/shell-context.jsx
"use client";

import { createContext, useContext, useMemo, useState } from "react";

/**
 * Sidebar open/closed state, shared across the layout boundary.
 *
 * The mobile nav toggle belongs in the app bar (`app/dashboard/layout.jsx`),
 * but the sidebar it opens is rendered by the DashboardLayout *component*,
 * which each page mounts itself. Those two live on opposite sides of the
 * layout/page split and cannot pass props to each other, so the state sits in
 * a provider the layout mounts once.
 *
 * Before this, the toggle was a floating button pinned over the page content
 * at `top-19 left-4` — it overlapped headings and had no relationship to the
 * bar above it.
 */
const ShellContext = createContext(null);

export function DashboardShellProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const value = useMemo(() => ({ sidebarOpen, setSidebarOpen }), [sidebarOpen]);
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

/** Returns a no-op shell when used outside the provider, so a component that
 *  renders in isolation (e.g. a Storybook-less one-off page) never crashes. */
export function useDashboardShell() {
  return useContext(ShellContext) ?? { sidebarOpen: false, setSidebarOpen: () => {} };
}
