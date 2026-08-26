"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Edit2,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import {
  useUpdateProductQuantity,
} from "@/hooks/use-inventory";
import { avatarStyle } from "@/lib/theme/avatar";

const productImages = {
  1: "/assets/svgs/vendor/inventory/tbmHydraulicPump.svg",
  2: "/assets/svgs/vendor/inventory/logicController.svg",
  3: "/assets/svgs/vendor/inventory/steelPackaging.svg",
  4: "/assets/svgs/vendor/inventory/proToolKitSet.svg",
};

const stockStatusStyles = {
  success: {
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  warning: {
    bg: "bg-danger/10",
    text: "text-danger",
    dot: "bg-danger",
  },
  error: {
    bg: "bg-white/05",
    text: "text-white",
    dot: "bg-surface-raised",
  },
};

export default function InventoryProductsTable({ products, isLoading }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const updateQuantity = useUpdateProductQuantity();


  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    updateQuantity.mutate({ id: productId, quantity: newQuantity });
  };

  // `updateQuantity` is one mutation instance shared by every row's +/- buttons.
  // Gating on `.isPending` alone would disable every row's buttons while any
  // single row is in flight, so pending is scoped to the row actually mutating.
  const pendingProductId = updateQuantity.isPending
    ? updateQuantity.variables?.id
    : null;

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products?.map((p) => p.id) || []);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-[6.96px] border-[0.59px] border-white/08">
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-white/08 border-t-white/10 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-inter text-[12.19px]">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-surface rounded-[6.96px] border-[0.59px] border-white/08 p-12 text-center">
        <p className="text-white/60 font-inter text-[12.19px]">
          No products found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Scroll Hint - Mobile only */}
      <div className="md:hidden px-4 py-2 bg-white/05 border-b border-white/08 flex items-center justify-center gap-2 text-white/60">
        <ChevronRight size={14} className="animate-pulse" />
        <span className="font-inter text-[10.45px]">
          Swipe to see more options
        </span>
      </div>

      {/* Desktop Table Header */}
      <div className="hidden md:block px-6 py-4 bg-white/15 border-b border-white/08">
        <div className="grid grid-cols-[40px_1fr_90px_140px_120px_200px_110px] gap-4 items-center">
          <input
            type="checkbox"
            checked={selectedProducts.length === products.length}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-white/20 text-white focus:ring-2 focus:ring-accent/40 cursor-pointer"
          />
          <span className="font-inter text-[10.45px] font-bold text-white uppercase tracking-[0.52px] leading-[13.93px]">
            PRODUCT DETAILS
          </span>
          <span className="font-inter text-[10.45px] font-bold text-white uppercase tracking-[0.52px] leading-[13.93px]">
            SKU
          </span>
          <span className="font-inter text-[10.45px] font-bold text-white uppercase tracking-[0.52px] leading-[13.93px]">
            LOCATION
          </span>
          <span className="font-inter text-[10.45px] font-bold text-white uppercase tracking-[0.52px] leading-[13.93px]">
            STOCK STATUS
          </span>
          <span className="font-inter text-[10.45px] font-bold text-white uppercase tracking-[0.52px] leading-[13.93px] text-center">
            QUANTITY
          </span>
          <span className="font-inter text-[10.45px] font-bold text-white uppercase tracking-[0.52px] leading-[13.93px] text-center">
            ACTIONS
          </span>
        </div>
      </div>

      {/* Table Body - Scrollable on mobile */}
      <div className="divide-y divide-white/10">
        {products.map((product, index) => {
          const statusStyle = stockStatusStyles[product.stockStatusColor];
          const isSelected = selectedProducts.includes(product.id);
          const isOutOfStock = product.quantity === 0;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`transition-colors ${
                isSelected ? "bg-white/05" : "hover:bg-white/05"
              }`}
            >
              {/* Desktop View */}
              <div className="hidden md:grid md:grid-cols-[40px_1fr_90px_140px_120px_200px_110px] gap-4 items-center px-6 py-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectProduct(product.id)}
                  className="w-4 h-4 rounded border-white/20 text-white focus:ring-2 focus:ring-accent/40 cursor-pointer"
                />

                <div className="flex items-center gap-3">
                  {productImages[product.id] ? (
                    <img
                      src={productImages[product.id]}
                      alt={product.name}
                      width={35}
                      height={35}
                      className="flex-shrink-0 object-contain"
                    />
                  ) : (
                    <div
                      className="w-[35px] h-[35px] rounded-[6.53px] flex items-center justify-center shrink-0"
                      style={avatarStyle(product.id ?? product.name)}
                      >
                        <span className="font-bold text-[10px] uppercase">
                          {product.name.substring(0, 2)}
                        </span>
                      </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-inter text-[12.19px] font-medium text-white leading-[17.41px] truncate">
                      {product.name}
                    </h3>
                    <p className="font-inter text-[10.45px] font-normal text-white leading-[13.93px]">
                      {product.category}
                    </p>
                  </div>
                </div>

                <span className="font-inter text-[12.19px] font-normal text-white leading-[17.41px]">
                  {product.sku}
                </span>

                <span className="font-inter text-[12.19px] font-normal text-white leading-[17.41px]">
                  {product.location}
                </span>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full font-inter text-[10.45px] font-medium ${statusStyle.bg} ${statusStyle.text} inline-flex items-center gap-1.5`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusStyle.dot} flex-shrink-0`} />
                    {product.stockStatus}
                  </span>
                </div>

                <div className="flex justify-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleQuantityChange(product.id, product.quantity, -1)
                        }
                        disabled={
                          product.quantity === 0 ||
                          pendingProductId === product.id
                        }
                        className="disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <img src="/assets/svgs/vendor/inventory/removeButton.svg" alt="Remove" width={25} height={25} />
                      </motion.button>

                      <div className="inline-flex items-center justify-center min-w-[50px] px-3 py-1 border-[0.87px] border-white/10 rounded-[3.48px]">
                        <span className="font-inter text-[12.19px] font-bold text-white leading-[17.41px]">
                          {pendingProductId === product.id ? (
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            product.quantity
                          )}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleQuantityChange(product.id, product.quantity, 1)
                        }
                        disabled={pendingProductId === product.id}
                        className="disabled:opacity-30"
                      >
                        <img src="/assets/svgs/vendor/inventory/addButton.svg" alt="Add" width={25} height={25} />
                      </motion.button>
                    </div>
                    <span className="font-inter text-[10.45px] font-normal text-white leading-[13.93px] block mt-0.5">
                      Reorder: {product.reorderPoint}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {isOutOfStock ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Reorder Product"
                    >
                      <img src="/assets/svgs/vendor/inventory/blueCartActions.svg" alt="Reorder" width={28} height={28} />
                    </motion.button>
                  ) : product.stockStatusColor === "warning" ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Low Stock"
                    >
                      <img src="/assets/svgs/vendor/inventory/redCartActions.svg" alt="Low Stock" width={28} height={28} />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Refresh Stock"
                    >
                      <img src="/assets/svgs/vendor/inventory/timerIconActions.svg" alt="Refresh" width={28} height={28} />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Edit Product"
                  >
                    <img src="/assets/svgs/vendor/inventory/pencilIconActions.svg" alt="Edit" width={28} height={28} />
                  </motion.button>
                </div>
              </div>

              {/* Mobile View - Card Layout */}
              <div className="md:hidden p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-4 h-4 rounded border-white/20 text-white focus:ring-2 focus:ring-accent/40 cursor-pointer mt-1"
                  />
                  {productImages[product.id] ? (
                    <img
                      src={productImages[product.id]}
                      alt={product.name}
                      width={35}
                      height={35}
                      className="flex-shrink-0 object-contain"
                    />
                  ) : (
                    <div
                      className="w-[35px] h-[35px] rounded-[6.53px] flex items-center justify-center shrink-0"
                      style={avatarStyle(product.id ?? product.name)}
                      >
                        <span className="font-bold text-[10px] uppercase">
                          {product.name.substring(0, 2)}
                        </span>
                      </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-inter text-[12.19px] font-medium text-white leading-[17.41px]">
                      {product.name}
                    </h3>
                    <p className="font-inter text-[10.45px] font-normal text-white leading-[13.93px]">
                      {product.category}
                    </p>
                    <p className="font-inter text-[10.45px] text-white/40 mt-1">
                      {product.sku} • {product.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full font-inter text-[10.45px] font-medium ${statusStyle.bg} ${statusStyle.text} inline-flex items-center gap-1.5`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusStyle.dot} flex-shrink-0`} />
                    {product.stockStatus}
                  </span>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        handleQuantityChange(product.id, product.quantity, -1)
                      }
                      disabled={
                        product.quantity === 0 ||
                        pendingProductId === product.id
                      }
                      className="w-7 h-7 bg-white/10 text-white rounded-[5.22px] flex items-center justify-center active:bg-white/20 transition-colors disabled:opacity-30"
                    >
                      <Minus size={12} />
                    </motion.button>

                    <div className="text-center min-w-[50px]">
                      <span className="font-inter text-[12.19px] font-bold text-white">
                        {pendingProductId === product.id ? (
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          product.quantity
                        )}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        handleQuantityChange(product.id, product.quantity, 1)
                      }
                      disabled={pendingProductId === product.id}
                      className="w-7 h-7 bg-white/10 text-white rounded-[5.22px] flex items-center justify-center active:bg-white/20 transition-colors"
                    >
                      <Plus size={12} />
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/08">
                  {isOutOfStock && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 text-danger hover:bg-danger/10 rounded-[5.22px] transition-colors"
                    >
                      <ShoppingCart size={16} />
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 text-white/60 hover:bg-white/05 rounded-[5.22px] transition-colors"
                  >
                    <Edit2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
