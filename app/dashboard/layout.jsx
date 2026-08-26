import AppBar from "@/components/shared/dashboard/app-bar";
import { DashboardShellProvider } from "@/components/shared/dashboard/shell-context";
import "../globals.css";

// No <Providers> here — the root layout (app/layout.js) already supplies them.

export const metadata = {
  title: "My Dashboard | TBM Building Services",
  description: "Manage your projects, orders, saved designs, and account settings.",
};

export default function UserDashboardLayout({ children }) {
  return (
    // The provider only holds sidebar open/closed state. `children` is passed
    // through untouched, so the pages below stay server components.
    <DashboardShellProvider>
      {/* The signed-in app bar, not the marketing navbar — see app-bar.jsx.
          The footer lives in the DashboardLayout *component*, not here, so a
          focused full-page task can opt out of the whole dashboard shell —
          sidebar and footer strip together — while every page that renders
          DashboardLayout still gets both. */}
      <AppBar />
      <div className="mt-16">{children}</div>
    </DashboardShellProvider>
  );
}
