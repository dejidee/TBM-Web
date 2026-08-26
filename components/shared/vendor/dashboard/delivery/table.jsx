"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Pencil } from "lucide-react";
import { useOrderStatuses } from "@/hooks/use-lookups";
import { useUpdateDeliveryAssignment } from "@/hooks/use-delivery";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * GET /vendor/deliveries returns `{ id, orderId, orderNumber, status,
 * trackingNumber, deliveryPartner, deliveryAgentName, deliveryAgentPhone,
 * assignmentNote, updatedAtUtc }` — confirmed live 2026-08-12. This used to
 * render `assignment.customer.{name,address}`, `.expectedDate`, `.isOverdue`,
 * and a string `.status` ("Picked Up"/"Urgent"/…) — none of which exist on
 * the real response. `assignment.customer.name` would have thrown
 * (`customer` is undefined) the first time a real vendor loaded this page.
 *
 * `status` is a bare number — the same OrderStatus enum GET /vendor/orders
 * uses (`GET /lookups/order-statuses`, hooks/use-lookups.js), not a
 * delivery-specific one; rendered by lookup with a graceful numeric fallback
 * if a value this app hasn't seen shows up.
 */
export default function DeliveryAssignmentsTable({ assignments, isLoading, isError }) {
  const { data: orderStatuses } = useOrderStatuses();
  const updateAssignment = useUpdateDeliveryAssignment();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ deliveryPartner: "", trackingNumber: "" });

  const statusLabel = (status) =>
    orderStatuses?.find((s) => s.value === status)?.name ?? `Status ${status}`;

  const startEdit = (assignment) => {
    setEditingId(assignment.id);
    setDraft({
      deliveryPartner: assignment.deliveryPartner || "",
      trackingNumber: assignment.trackingNumber || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ deliveryPartner: "", trackingNumber: "" });
  };

  const save = (assignment) => {
    updateAssignment.mutate(
      { orderId: assignment.orderId, updates: draft },
      { onSuccess: () => setEditingId(null) },
    );
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-white/08">
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-white/08 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted font-manrope text-[14px]">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface rounded-xl border border-white/08 p-12 text-center">
        <p className="text-muted font-manrope text-[14px]">
          Couldn&rsquo;t load deliveries. Your data is safe — this is a problem
          reaching it. Try again in a moment.
        </p>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-white/08 p-12 text-center">
        <p className="text-muted font-manrope text-[14px]">No assignments found</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-white/08 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto table-scroll">
        <div className="px-6 py-4 bg-white/05 border-b border-white/08 min-w-215">
          <div className="grid grid-cols-[140px_140px_1fr_1fr_140px] gap-4 items-center">
            {["ORDER", "STATUS", "DELIVERY PARTNER", "TRACKING #", "ACTIONS"].map((h) => (
              <span
                key={h}
                className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        <div className="divide-y divide-white/08">
          {assignments.map((assignment, index) => {
            const isEditing = editingId === assignment.id;
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="px-6 py-4 min-w-215 hover:bg-white/05 transition-colors"
              >
                <div className="grid grid-cols-[140px_140px_1fr_1fr_140px] gap-4 items-center">
                  <span className="font-manrope text-[14px] font-bold text-white">
                    #{assignment.orderNumber}
                  </span>

                  <span className="px-2.5 py-1 rounded bg-white/08 text-muted font-manrope text-[11px] font-bold w-fit">
                    {statusLabel(assignment.status)}
                  </span>

                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="e.g. DHL Express"
                      value={draft.deliveryPartner}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, deliveryPartner: e.target.value }))
                      }
                      className="px-3 py-2 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  ) : (
                    <span className="font-manrope text-[13px] text-white truncate">
                      {assignment.deliveryPartner || (
                        <span className="text-muted/60 italic">Not assigned</span>
                      )}
                    </span>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="Enter tracking #"
                      value={draft.trackingNumber}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, trackingNumber: e.target.value }))
                      }
                      className="px-3 py-2 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  ) : (
                    <span className="font-manrope text-[13px] text-white font-mono truncate">
                      {assignment.trackingNumber || <span className="text-muted/60 italic font-sans">—</span>}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => save(assignment)}
                          disabled={updateAssignment.isPending}
                          className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(assignment)}
                        className="p-2 text-muted hover:bg-white/08 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/08">
        {assignments.map((assignment, index) => {
          const isEditing = editingId === assignment.id;
          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-manrope text-[15px] font-bold text-white">
                  #{assignment.orderNumber}
                </span>
                <span className="px-2.5 py-1 rounded bg-white/08 text-muted font-manrope text-[11px] font-bold">
                  {statusLabel(assignment.status)}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    placeholder="Delivery partner, e.g. DHL Express"
                    value={draft.deliveryPartner}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, deliveryPartner: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <input
                    type="text"
                    placeholder="Tracking number"
                    value={draft.trackingNumber}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, trackingNumber: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => save(assignment)}
                      disabled={updateAssignment.isPending}
                      className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg bg-success/10 text-success font-manrope text-[13px] font-medium disabled:opacity-50"
                    >
                      <Check size={16} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg bg-danger/10 text-danger font-manrope text-[13px] font-medium"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 mb-3">
                  <p className="font-manrope text-[13px] text-white/70">
                    Partner:{" "}
                    <span className="text-white">
                      {assignment.deliveryPartner || (
                        <span className="text-muted/60 italic">Not assigned</span>
                      )}
                    </span>
                  </p>
                  <p className="font-manrope text-[13px] text-white/70">
                    Tracking:{" "}
                    <span className="text-white font-mono">
                      {assignment.trackingNumber || "—"}
                    </span>
                  </p>
                </div>
              )}

              {!isEditing && (
                <button
                  onClick={() => startEdit(assignment)}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-white/10 text-white font-manrope text-[13px] font-medium hover:bg-white/05 transition-colors"
                >
                  <Pencil size={16} /> Edit
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
