// Transaction status chips for the admin surface.
//
// These used to be read off `txn.statusColor`, which the API never sends — so
// every chip fell through to a light `bg-gray-100 / text-gray-600` pair, and
// the dot color was recovered by regex-matching a hex out of the Tailwind class
// string. Deriving from `txn.status` removes both problems.

const CHIPS = {
  paid: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  successful: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  pending: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  processing: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  failed: { bg: "bg-danger/10", text: "text-danger", dot: "bg-danger" },
  refunded: { bg: "bg-danger/10", text: "text-danger", dot: "bg-danger" },
};

const FALLBACK = { bg: "bg-white/08", text: "text-muted", dot: "bg-muted" };

export function txnStatusChip(status) {
  if (!status) return FALLBACK;
  return CHIPS[String(status).toLowerCase()] ?? FALLBACK;
}

// Consultation booking status — a real string the backend names:
// "PendingPayment", "Confirmed", "Cancelled" observed; anything else falls
// through to the neutral chip rather than being invented here.
const CONSULTATION_CHIPS = {
  confirmed: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  pendingpayment: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  completed: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  cancelled: { bg: "bg-danger/10", text: "text-danger", dot: "bg-danger" },
};

export function consultationStatusChip(status) {
  if (!status) return FALLBACK;
  return CONSULTATION_CHIPS[String(status).toLowerCase()] ?? FALLBACK;
}

/** "PendingPayment" → "Pending payment" for display; other values pass through. */
export function consultationStatusLabel(status) {
  if (!status) return "—";
  return String(status).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^(\w)(\w*)/, (_, a, b) => a + b.toLowerCase());
}
