"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/hooks/use-admin-users";
import UserManagementTable from "@/components/shared/admin/dashboard/user-management-table";
import UserManagementFilters from "@/components/shared/admin/dashboard/user-management-filters";
import AddUserModal from "@/components/shared/admin/dashboard/add-user-modal";
import addNewUser from "@/public/assets/svgs/userAndRoleMgt/addNewUser.svg";
import Image from "next/image";

export default function UserManagementPage() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Filter states
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("any");

  // Debounced search — fires the query only 300ms after the user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  // Track initial load to show full-page spinner only once
  const isInitialMount = useRef(true);
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Fetch users with filters using real API
  const { data, isLoading, isError } = useAdminUsers({
    page,
    pageSize: 5,
    search: debouncedSearch,
    role: role === "all" ? "" : role,
    status: status === "any" ? "" : status,
  });

  // Mutations
  const createUser = useCreateUser();
  const updateUserRole = useUpdateUserRole();
  const updateUserStatus = useUpdateUserStatus();

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Search updates local state immediately (debounce effect above throttles the query)
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  const handleRoleChange = useCallback((value) => {
    setRole(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleCreateUser = useCallback(
    (userData) => {
      createUser.mutate(userData, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
        // useCreateUser's onError already shows a toast; the modal just stays
        // open so the admin can fix the input and retry.
      });
    },
    [createUser]
  );

  const handleEditUser = useCallback((user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);

  const handleUpdateUser = useCallback(
    (userData) => {
      const { id, role, isActive } = userData;

      // Normalise the current user's role/status from the backend shape
      const currentRole = Array.isArray(editingUser?.roles)
        ? editingUser.roles[0]
        : editingUser?.role;
      const currentIsActive = editingUser?.status
        ? editingUser.status.toLowerCase() === "active"
        : editingUser?.isActive;

      const updates = [];
      if (currentRole !== role) {
        updates.push(updateUserRole.mutateAsync({ id, newRole: role }));
      }
      if (currentIsActive !== isActive) {
        updates.push(updateUserStatus.mutateAsync({ id, isActive }));
      }

      // Each mutation's own onError already shows a toast for its field; this
      // catch only stops the modal from closing on a rejected Promise.all.
      Promise.all(updates)
        .then(() => {
          setIsModalOpen(false);
          setEditingUser(null);
        })
        .catch(() => {});
    },
    [editingUser, updateUserRole, updateUserStatus]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleAddNewUser = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  // Only show full-page loading on initial mount
  if (isLoading && isInitialMount.current) {
    return (
      <div className="max-w-360 mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/10 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 font-manrope text-[14px]">
              Loading users...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-360 mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-danger font-manrope text-[16px] font-medium mb-2">
              Error loading users
            </p>
            <p className="text-white/50 font-manrope text-[14px]">
              Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-360 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-manrope text-[32px] font-bold text-white mb-2">
              User & Role Management
            </h1>
            <p className="font-manrope text-[14px] text-white/50">
              Manage access, roles, and account statuses across the platform.
            </p>
          </div>

          {/* Add New User Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNewUser}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-manrope text-[13px] font-medium text-white bg-accent-solid hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-surface transition-opacity"
          >
            <Image src={addNewUser} alt="Add New User" />
            Add New User
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <UserManagementFilters
        search={search}
        role={role}
        status={status}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
      />

      {/* Users Table */}
      <div className="relative">
        {isLoading && !isInitialMount.current && (
          <div className="absolute top-4 right-4 z-10">
            <div className="w-6 h-6 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
          </div>
        )}
        <UserManagementTable
          data={data?.users || []}
          pagination={data?.pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading && !isInitialMount.current}
          onEditUser={handleEditUser}
        />
      </div>

      {/* Add/Edit User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateUser={handleCreateUser}
        editUser={editingUser}
        onUpdateUser={handleUpdateUser}
        isSubmitting={
          createUser.isPending ||
          updateUserRole.isPending ||
          updateUserStatus.isPending
        }
      />
    </div>
  );
}
