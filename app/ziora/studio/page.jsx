import { Suspense } from "react";

import StudioView from "@/components/shared/ziora/studio-view";
import StudioLoading from "./loading";

/**
 * StudioView reads `?prompt=` via useSearchParams, which opts the subtree into
 * client-side rendering — Next requires a Suspense boundary around it, and
 * without one the whole route would be forced dynamic. Reusing loading.jsx as
 * the fallback keeps the two skeletons identical by construction.
 */
export default function ZioraStudioPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioView />
    </Suspense>
  );
}
