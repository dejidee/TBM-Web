// hooks/use-lookups.js
import { useQuery } from "@tanstack/react-query";
import { lookupsAPI } from "@/lib/api/lookups";

/**
 * GET /api/v1/lookups/order-statuses — names the OrderStatus enum (0-7),
 * which the spec itself only lists as bare integers (CLAUDE.md). Public, no
 * auth needed. A static lookup table, not user data — never goes stale
 * within a session.
 *
 * `{ success, message, data: [{ name, value }] }` — unwrapped to the bare
 * array here.
 */
export function useOrderStatuses() {
  return useQuery({
    queryKey: ["lookups", "order-statuses"],
    queryFn: lookupsAPI.getOrderStatuses,
    select: (res) => res?.data ?? [],
    staleTime: Infinity,
  });
}
