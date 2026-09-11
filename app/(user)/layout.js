// app/(user)/layout.jsx
import "../globals.css";
import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import TBMConcierge from "@/components/common/concierge/main";

// No <Providers> here — the root layout (app/layout.js) already supplies them.
// Nesting a second QueryClientProvider gives this subtree its own cache, and
// renders LoadingScreen and TBMToaster twice.

export const metadata = {
  title: "TBM Building Services: Design. Price. Build.",
  description:
    "Premium renovation, construction materials, and AI-powered space visualization across Abuja and Lagos.",
};

export default function UserLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      {/* Floating AI Assistant — rendered outside page flow, fixed positioned */}
      <TBMConcierge />
    </>
  );
}
