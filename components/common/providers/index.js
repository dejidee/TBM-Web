import { MotionConfig } from "framer-motion";

import { TBMToaster } from "@/components/shared/toast";
import LoadingScreen from "@/components/common/loading-screen";
import QueryProvider from "./QueryProvider";

/**
 * `reducedMotion="user"` makes every framer-motion animation in the app honour
 * the OS "reduce motion" setting. Nothing did before: the dashboard animates a
 * card in on every mount, and for a user with a vestibular disorder that is not
 * polish, it is a symptom trigger.
 *
 * It has to be framer's own config rather than a CSS rule — framer drives
 * transforms from JavaScript, so `@media (prefers-reduced-motion)` in the
 * stylesheet cannot see or stop them. The rule in globals.css covers the
 * transitions framer is not responsible for; this covers the rest.
 *
 * "user" rather than "always" disables transform and layout animation while
 * keeping opacity fades — content still changes, it just stops moving.
 */
export default function Providers({ children }) {
  return (
    <QueryProvider>
      <MotionConfig reducedMotion="user">
        <LoadingScreen />
        {children}
        <TBMToaster />
      </MotionConfig>
    </QueryProvider>
  );
}
