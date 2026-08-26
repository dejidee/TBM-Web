"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, ChevronLeft, ChevronRight, Edit2, Trash2, Zap } from "lucide-react";
import { roleBadge } from "@/lib/theme/roles";
import { avatarStyle, initialsOf } from "@/lib/theme/avatar";
import { useUpdateUserStatus, useDeleteUser } from "@/hooks/use-admin-users";
import ConfirmDeleteModal from "./confirm-delete-modal";
import Image from "next/image";

export default function UserManagementTable({
  data,
  pagination,
  onPageChange,
  onEditUser,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [activeUser, setActiveUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [mounted, setMounted] = useState(false);
  const menuDropdownRef = useRef(null);
  const router = useRouter();
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  // Track mount for portal
  useEffect(() => { setMounted(true); }, []);

  // Close menu on outside click, scroll, or resize
  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = (e) => {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    const handleClose = () => setOpenMenuId(null);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [openMenuId]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-white/08 p-12 text-center">
        <p className="text-white/50 font-manrope text-[14px]">
          No users found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  const handleToggleStatus = (userId, currentStatus) => {
    updateStatus.mutate({ id: userId, isActive: !currentStatus });
  };

  // One mutation instance backs every row's switch — scope pending to the row
  // actually mutating, or one slow toggle disables every user's switch.
  const pendingUserId = updateStatus.isPending
    ? updateStatus.variables?.id
    : null;

  const handleDeleteUser = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const handleEditUser = (userId) => {
    const user = data?.find((u) => u?.id === userId);
    if (user && onEditUser) onEditUser(user);
    setOpenMenuId(null);
  };

  const handleViewAIUsage = (user) => {
    const params = new URLSearchParams({
      userId: user.id,
      userName: user.fullName || user.name || "",
      userEmail: user.email || "",
    });
    router.push(`/admin/dashboard/ai-usage?${params.toString()}`);
    setOpenMenuId(null);
  };

  const toggleMenu = (user, e) => {
    if (openMenuId === user?.id) {
      setOpenMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setActiveUser(user);
    setOpenMenuId(user?.id);
  };

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Single portal dropdown — rendered into document.body to escape overflow clipping
  const portalDropdown = mounted && openMenuId && activeUser
    ? createPortal(
        <AnimatePresence>
          {openMenuId && activeUser && (
            <motion.div
              ref={menuDropdownRef}
              key="user-actions-menu"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "fixed",
                top: menuPos.top,
                right: menuPos.right,
                zIndex: 9999,
              }}
              className="w-48 bg-surface rounded-lg shadow-xl border border-white/12 overflow-hidden"
            >
              <button
                onClick={() => handleViewAIUsage(activeUser)}
                className="w-full px-4 py-3 text-left font-manrope text-[14px] text-white/80 hover:bg-white/05 transition-colors flex items-center gap-3"
              >
                <Zap size={16} />
                View AI Usage
              </button>
              <button
                onClick={() => handleEditUser(activeUser?.id)}
                className="w-full px-4 py-3 text-left font-manrope text-[14px] text-white/80 hover:bg-white/05 transition-colors flex items-center gap-3"
              >
                <Edit2 size={16} />
                Edit User
              </button>
              <button
                onClick={() => handleDeleteUser(activeUser?.id, activeUser?.name)}
                className="w-full px-4 py-3 text-left font-manrope text-[14px] text-danger hover:bg-danger/10 transition-colors flex items-center gap-3"
              >
                <Trash2 size={16} />
                Delete User
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      {portalDropdown}

      <div className="bg-surface rounded-xl border border-white/08">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/05 border-b border-white/08">
              <tr>
                <th className="px-6 py-4 text-left">
                  <span className="font-manrope text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    USER ID
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="font-manrope text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    USER
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="font-manrope text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    EMAIL
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="font-manrope text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    ROLE
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="font-manrope text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    STATUS
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="font-manrope text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    ACTIONS
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/08">
              {data?.map((user, index) => {
                const userRole = Array.isArray(user?.roles) ? user.roles[0] : user?.role;
                const roleColor = roleBadge(userRole);
                const isActive = user?.status
                  ? user.status.toLowerCase() === "active"
                  : Boolean(user?.isActive);

                return (
                  <motion.tr
                    key={user?.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/03 transition-colors"
                  >
                    {/* User ID */}
                    <td className="px-6 py-4">
                      <span className="font-manrope text-[14px] text-white/40">
                        #{user?.id || "N/A"}
                      </span>
                    </td>

                    {/* User (Avatar + Name) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user?.avatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={user.avatar}
                              alt={user?.name || "User"}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-manrope font-bold text-[14px]"
                            style={avatarStyle(user?.id ?? user?.email)}
                          >
                            {initialsOf(user)}
                          </div>
                        )}
                        <span className="font-manrope text-[14px] font-medium text-white">
                          {user?.fullName || user?.name || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <span className="font-manrope text-[14px] text-white/50">
                        {user?.email || "N/A"}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full font-manrope text-[13px] font-medium  `}
                      >
                        {userRole || "N/A"}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      <button
                        role="switch"
                        aria-checked={isActive}
                        aria-label={`${isActive ? "Deactivate" : "Activate"} ${user?.fullName || user?.name || "user"}`}
                        onClick={() => handleToggleStatus(user?.id, isActive)}
                        disabled={pendingUserId === user?.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/60 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed ${
                          isActive ? "bg-success-solid" : "bg-track-off"
                        }`}
                      >
                        {pendingUserId === user?.id ? (
                          <span className="mx-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        )}
                      </button>
                    </td>

                    {/* Actions — trigger only, dropdown renders in portal */}
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => toggleMenu(user, e)}
                        className="text-white/40 hover:text-white transition-colors"
                        aria-label="User actions"
                      >
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-white/08">
          {data?.map((user, index) => {
            const userRole = Array.isArray(user?.roles) ? user.roles[0] : user?.role;
            const roleColor = roleBadge(userRole);
            const isActive = user?.status
              ? user.status.toLowerCase() === "active"
              : Boolean(user?.isActive);

            return (
              <motion.div
                key={user?.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  {user?.avatar ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={user.avatar}
                        alt={user?.name || "User"}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-manrope font-bold text-[14px]"
                      style={avatarStyle(user?.id ?? user?.email)}
                    >
                      {initialsOf(user)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-manrope text-[14px] font-medium text-white">
                      {user?.fullName || user?.name || "N/A"}
                    </p>
                    <p className="font-manrope text-[12px] text-white/40">
                      #{user?.id || "N/A"}
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`${isActive ? "Deactivate" : "Activate"} ${user?.fullName || user?.name || "user"}`}
                    onClick={() => handleToggleStatus(user?.id, isActive)}
                    disabled={pendingUserId === user?.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/60 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed ${
                      isActive ? "bg-success-solid" : "bg-track-off"
                    }`}
                  >
                    {pendingUserId === user?.id ? (
                      <span className="mx-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    )}
                  </button>
                </div>

                {/* Email, Role, and Actions */}
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-manrope text-[13px] text-white/50 mb-2">
                      {user?.email || "N/A"}
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full font-manrope text-[13px] font-medium  `}
                    >
                      {userRole || "N/A"}
                    </span>
                  </div>

                  {/* Trigger — dropdown renders in portal */}
                  <button
                    onClick={(e) => toggleMenu(user, e)}
                    className="text-white/40 hover:text-white transition-colors p-2"
                    aria-label="User actions"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination Footer */}
        {pagination && (
          <div className="px-6 py-4 border-t border-white/08 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-manrope text-[13px] text-white/50">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * (pagination?.limit || 0) + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * (pagination?.limit || 0),
                  pagination?.total || 0
                )}
              </span>{" "}
              of <span className="font-medium">{pagination?.total || 0}</span> results
            </p>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-white/10 text-white/60 hover:bg-white/05 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </motion.button>

              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 font-manrope text-[13px] text-muted"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg font-manrope text-[13px] font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-white/10 text-white"
                        : "border border-white/10 text-white/60 hover:bg-white/05"
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-white/10 text-white/60 hover:bg-white/05 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={confirmDelete}
          userName={userToDelete?.name}
          itemLabel="User"
          isDeleting={deleteUser.isPending}
        />
      </div>
    </>
  );
}
