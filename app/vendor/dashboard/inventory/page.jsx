"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import locationIcon from "@/public/assets/svgs/vendor/inventory/location.svg";
import filterIcon from "@/public/assets/svgs/vendor/inventory/filter.svg";
import { useInventoryProducts, useInventoryStats, useAddProduct } from "@/hooks/use-inventory";
import InventoryStatsCards from "@/components/shared/vendor/dashboard/inventory/stats";
import InventoryProductsTable from "@/components/shared/vendor/dashboard/inventory/table";
import AddProductModal from "@/components/shared/vendor/dashboard/add-product";

function InventoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    stockStatus: "all",
    location: "all",
    archived: false,
  });

  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const { data: stats } = useInventoryStats();
  const { data, isLoading } = useInventoryProducts(filters);
  const addProduct = useAddProduct();

  // DATA CHECKS

  // Auto-open modal based on URL query parameter
  useEffect(() => {
    const openParam = searchParams.get("open");
    if (openParam === "add-product") {
      setIsAddProductModalOpen(true);
    }
  }, [searchParams]);

  const handleSearch = (value) => {
    setSearchInput(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    let stockStatus = "all";

    if (tab === "lowstock") stockStatus = "lowstock";
    if (tab === "outofstock") stockStatus = "outofstock";
    if (tab === "archived") {
      setFilters((prev) => ({
        ...prev,
        archived: true,
        stockStatus: "all",
        page: 1,
      }));
      return;
    }

    setFilters((prev) => ({ ...prev, stockStatus, archived: false, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const tabs = [
    { id: "all", label: "All Items", count: data?.stats?.all || 142 },
    { id: "lowstock", label: "Low Stock", count: data?.stats?.lowStock || 8 },
    {
      id: "outofstock",
      label: "Out of Stock",
      count: data?.stats?.outOfStock || 2,
    },
    { id: "archived", label: "Archived", count: data?.stats?.archived || 0 },
  ];
  const handleCloseModal = () => {
    setIsAddProductModalOpen(false);
    // Remove query parameter from URL when closing modal
    const currentPath = window.location.pathname;
    router.replace(currentPath);
  };

  const handleAddProduct = async (productData) => {
    try {
      // Map form data to match API schema from Swagger
      const apiPayload = {
        name: productData.name,
        description: productData.description || "",
        shortDescription: productData.description || "",
        categoryId: productData.categoryID,
        sku: productData.sku,
        brandType: productData.brandType, // Empty string as shown in Swagger
        productType: productData.productType, // Empty string as shown in Swagger
        price: Number(productData.unitPrice) || 0,
        stockQuantity: Number(productData.initialQuantity) || 0,
        lowStockThreshold: Number(productData.reorderPoint) || 0,
        isActive: true,
        trackInventory: true,
      };
      // console.log("payload form formik: ", productData)
      await addProduct.mutateAsync(apiPayload);
      handleCloseModal();
    } catch {
      // useAddProduct's onError already shows a toast; the modal just stays
      // open so the vendor can fix the input and retry.
    }
  };

  return (
    <div className="max-w-360 mx-auto bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row items-start justify-between mb-2">
          <div>
            <h1 className="font-inter text-[21.8px] font-bold text-white leading-[30.45px] tracking-[-0.63px] mb-2">
              Product Inventory
            </h1>
            <p className="font-inter text-[13.53px] font-normal text-white leading-[20.3px]">
              Manage the Bogat product catalog, track real-time stock levels,
              and update inventory
              <br />
              details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-0.5 md:py-2.5 bg-surface border-[0.87px] border-white/10 rounded-[6.96px] font-inter text-[12.19px] font-medium text-white hover:bg-white/05 transition-colors"
            >
              <Download size={16} />
              Export Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsAddProductModalOpen(true);
                router.push("/vendor/dashboard/inventory?open=add-product");
              }}
              className="flex items-center gap-2 px-4 py-0.5 md:py-2.5 bg-accent-solid text-white rounded-[6.96px] font-inter text-[12.19px] font-medium hover:bg-accent-solid/90 transition-colors"
            >
              <Plus size={16} />
              Add New Product
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStatsCards stats={stats} />

      {/* Table Container */}
      <div className="rounded-[10.45px] border-[0.59px] border-accent/50 overflow-hidden" style={{ boxShadow: '0 0.87px 1.74px 0 rgba(0,0,0,0.05)' }}>
      {/* Search and Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-surface border-b-[0.87px] border-accent"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by Product Name, SKU..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/08 border-[0.59px] border-white/10 rounded-[6.96px] font-inter text-[12.19px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-1 bg-white/08 rounded-[6.96px] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  px-3 py-1.5 rounded-[5.22px] font-inter text-[12.19px] font-medium
                  transition-colors flex items-center gap-1.5 leading-[17.41px] w-fit md:w-full
                  ${
                    activeTab === tab.id
                      ? "bg-accent-solid text-white"
                      : "text-white"
                  }
                `}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-full text-[10.45px] font-bold
                      ${
                        activeTab === tab.id
                          ? "bg-surface-raised text-white"
                          : "text-white"
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Location Filter */}
          <div className="relative">
            <Image
              src={locationIcon}
              alt=""
              width={16}
              height={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <select
              value={filters.location}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  location: e.target.value,
                  page: 1,
                }))
              }
              style={{ fieldSizing: "content" }}
              className="pl-9 pr-8 py-2.5 bg-accent-solid text-white border-[0.87px] border-white/10 rounded-[6.96px] font-inter text-[12.19px] font-medium focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">Location</option>
              <option value="warehouse-a">Warehouse A</option>
              <option value="warehouse-b">Warehouse B</option>
              <option value="warehouse-c">Warehouse C</option>
              <option value="warehouse-d">Warehouse D</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
              size={14}
            />
          </div>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-solid text-white border-[0.87px] border-white/10 rounded-[6.96px] font-inter text-[12.19px] font-medium transition-colors hover:bg-accent-solid/90"
          >
            <Image src={filterIcon} alt="" width={16} height={20} />
            Filter
          </motion.button>
        </div>
      </motion.div>

      {/* Products Table */}
      <InventoryProductsTable products={data?.products} isLoading={isLoading} />
      </div>

      {/* Pagination */}
      {data?.pagination && data.products?.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="font-inter text-[12.19px] font-normal text-white leading-[17.41px]">
            Showing{" "}
            <span className="font-medium text-white">
              {(data.pagination.page - 1) * data.pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-white">
              {Math.min(
                data.pagination.page * data.pagination.limit,
                data.pagination.total,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-white">
              {data.pagination.total}
            </span>{" "}
            results
          </p>

          {/* Joined pagination */}
          <div className="flex items-center overflow-hidden rounded-[6.96px] border-[0.87px] border-white/20">
            {/* Previous arrow */}
            <button
              onClick={() => handlePageChange(data.pagination.page - 1)}
              disabled={data.pagination.page === 1}
              className="w-8.25 h-[31.34px] flex items-center justify-center bg-surface border-r-[0.87px] border-white/20 text-white hover:bg-white/05 transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page numbers */}
            {[...Array(Math.min(data.pagination.totalPages, 3))].map(
              (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`
                      w-8.25 h-[31.34px] flex items-center justify-center
                      font-inter text-[12.19px] font-medium
                      border-r-[0.87px] border-white/20 transition-colors
                      ${
                        data.pagination.page === pageNum
                          ? "bg-accent-solid text-white"
                          : "bg-surface-raised text-white hover:bg-white/05"
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              },
            )}

            {data.pagination.totalPages > 3 && (
              <>
                <span className="w-[35.46px] h-[31.34px] flex items-center justify-center bg-surface border-r-[0.87px] border-white/20 font-inter text-[12.19px] text-white">
                  ...
                </span>
                <button
                  onClick={() => handlePageChange(data.pagination.totalPages)}
                  className={`
                    w-8.25 h-[31.34px] flex items-center justify-center
                    font-inter text-[12.19px] font-medium
                    border-r-[0.87px] border-white/20 transition-colors
                    ${
                      data.pagination.page === data.pagination.totalPages
                        ? "bg-accent-solid text-white"
                        : "bg-surface-raised text-white hover:bg-white/05"
                    }
                  `}
                >
                  {data.pagination.totalPages}
                </button>
              </>
            )}

            {/* Next arrow */}
            <button
              onClick={() => handlePageChange(data.pagination.page + 1)}
              disabled={data.pagination.page === data.pagination.totalPages}
              className="w-8.25 h-[31.34px] flex items-center justify-center bg-surface-raised text-white hover:bg-white/05 transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddProduct}
        isLoading={addProduct.isPending}
      />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InventoryContent />
    </Suspense>
  );
}
