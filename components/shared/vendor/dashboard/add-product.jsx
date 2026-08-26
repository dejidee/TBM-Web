"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, ChevronDown } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { showToast } from "@/components/shared/toast";
import { lookupsAPI } from "@/lib/api/lookups";
import { useCategories } from "@/hooks/use-products";

// Validation Schema
const validationSchema = Yup.object({
  productName: Yup.string()
    .required("Product name is required")
    .min(3, "Product name must be at least 3 characters"),
  sku: Yup.string().required("SKU is required"),
  categoryId: Yup.string().required("Category is required"),
  brandType: Yup.number()
    .required("Brand type is required")
    .min(0, "Brand type must be 0 or greater"),
  productType: Yup.number()
    .required("Product type is required")
    .min(0, "Product type must be 0 or greater"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  shortDescription: Yup.string()
    .required("Short description is required")
    .min(5, "Short description must be at least 5 characters"),
  unitPrice: Yup.number()
    .required("Unit price is required")
    .min(0, "Price must be greater than or equal to 0"),
  initialQuantity: Yup.number()
    .required("Initial quantity is required")
    .min(0, "Quantity must be greater than or equal to 0"),
  reorderPoint: Yup.number()
    .required("Reorder point is required")
    .min(0, "Reorder point must be greater than or equal to 0"),
});

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [productTypeEnum, setProductTypeEnum] = useState([]);
  const [brandTypeEnum, setBrandTypeEnum] = useState([]);

  // `categoryId` is a uuid from GET /Categories. This was previously filled from
  // /lookups/material-types, whose values are slugs ("hardwood") — the backend
  // could never resolve one to a category.
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const productTypeData = await lookupsAPI.getProductTypes();

        setProductTypeEnum(productTypeData?.data || []);

        // console.log("categoryData:", categoryData?.data);
      } catch (error) {
        console.error("Failed to fetch productTypes:", error);
      }
    };

    fetchProductTypes();
  }, []);

  useEffect(() => {
    const fetchBrandTypes = async () => {
      try {
        const brandTypeData = await lookupsAPI.getBrandTypes();

        setBrandTypeEnum(brandTypeData?.data || []);
      } catch (error) {
        console.error("Failed to fetch brandTypes:", error);
      }
    };

    fetchBrandTypes();
  }, []);

  const formik = useFormik({
    initialValues: {
      productName: "",
      sku: "",
      categoryId: "",
      brandType: 0,
      productType: 0,
      description: "",
      shortDescription: "",
      warehouseLocation: "",
      initialQuantity: 0,
      reorderPoint: 10,
      unitPrice: 0,
      isActive: true,
      trackInventory: true,
      productImages: [],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          name: values.productName,
          description: values.description,
          shortDescription: values.shortDescription,
          categoryId: values.categoryId,
          sku: values.sku,
          brandType: values.brandType,
          productType: values.productType,
          price: values.unitPrice,
          stockQuantity: values.initialQuantity,
          lowStockThreshold: values.reorderPoint,
          isActive: values.isActive,
          trackInventory: values.trackInventory,
        };

        // Call the parent onSubmit function
        const response = await onSubmit(payload, values.productImages);

        // Check if response contains an error
        if (response?.error || response?.errors) {
          const errorMessage =
            response.error ||
            (response.errors && typeof response.errors === "object"
              ? Object.values(response.errors).flat().join(", ")
              : "An error occurred while adding the product.");

          throw new Error(errorMessage);
        }

        // Show success toast
        showToast.success({
          title: "Product Added!",
          message: `${values.productName} has been successfully added to inventory.`,
        });

        // Reset form after successful submission
        resetForm();

        // Close modal
        onClose();
      } catch (error) {
        // If it's an authentication error (401), re-throw to allow logout/redirect
        if (
          error.status === 401 ||
          error.message?.includes("401") ||
          error.message?.toLowerCase().includes("unauthorized")
        ) {
          throw error; // Let the parent handle authentication
        }

        // Show error toast for other errors
        showToast.error({
          title: "Failed to Add Product",
          message:
            error.message ||
            "An error occurred while adding the product. Please try again.",
        });
        console.error("Error adding product:", error);
      }
    },
  });

  const handleGenerateSKU = () => {
    const randomSKU = `SKU-${Math.floor(Math.random() * 9000) + 1000}`;
    formik.setFieldValue("sku", randomSKU);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) =>
      file.type.startsWith("image/"),
    );

    // Create preview URLs for the images
    const newImages = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    formik.setFieldValue("productImages", [
      ...formik.values.productImages,
      ...newImages,
    ]);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = formik.values.productImages.filter(
      (_, i) => i !== index,
    );
    // Revoke the URL to free up memory
    URL.revokeObjectURL(formik.values.productImages[index].preview);
    formik.setFieldValue("productImages", updatedImages);
  };

  // Error message component
  const ErrorMessage = ({ name }) => {
    return formik.touched[name] && formik.errors[name] ? (
      <p className="text-danger text-[11px] mt-1 font-manrope">
        {formik.errors[name]}
      </p>
    ) : null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal — positioning only. A background here paints over the scrim
              above it and kills the backdrop blur. */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={formik.handleSubmit}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-160 max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/08">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-manrope text-[20px] font-bold text-white mb-1">
                      Add New Product
                    </h2>
                    <p className="font-manrope text-[13px] text-muted">
                      Enter the details to add a new item to the Bogat
                      inventory.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="text-muted hover:text-muted transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* General Information Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src="/assets/svgs/vendor/inventory/addNewProduct/generalInformation.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                    <h3 className="font-manrope text-[14px] font-bold text-white">
                      General Information
                    </h3>
                  </div>

                  {/* Product Name */}
                  <div className="mb-4">
                    <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="productName"
                      placeholder="e.g. Industrial Hydraulic Pump V4"
                      value={formik.values.productName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent ${
                        formik.touched.productName && formik.errors.productName
                          ? "border-danger"
                          : "border-white/08"
                      }`}
                    />
                    <ErrorMessage name="productName" />
                  </div>

                  {/* SKU and Category Row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* SKU */}
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        SKU
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            name="sku"
                            placeholder="SKU-0000"
                            value={formik.values.sku}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent ${
                              formik.touched.sku && formik.errors.sku
                                ? "border-danger"
                                : "border-white/08"
                            }`}
                          />
                          <ErrorMessage name="sku" />
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleGenerateSKU}
                          className="flex items-center gap-1.5 px-3 py-2.5 bg-white/08 border border-white/08 rounded-lg text-muted hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                          <RefreshCw size={12} />
                          <span className="font-manrope text-[11px] font-medium">
                            Auto
                          </span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          name="categoryId"
                          value={formik.values.categoryId}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={categoriesLoading}
                          className={`w-full px-4 py-2.5 pr-10 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent appearance-none cursor-pointer ${
                            formik.touched.categoryId &&
                            formik.errors.categoryId
                              ? "border-danger"
                              : "border-white/08"
                          }`}
                        >
                          <option value="">
                            {categoriesLoading
                              ? "Loading categories…"
                              : "Select Category"}
                          </option>
                          {(categories ?? []).map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        />
                      </div>
                      <ErrorMessage name="categoryId" />
                    </div>
                  </div>

                  {/* Brand Type and Product Type Row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Brand Type */}
                    {/* <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        Brand Type
                      </label>
                      <input
                        type="number"
                        name="brandType"
                        min="0"
                        placeholder="0"
                        value={formik.values.brandType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent ${
                          formik.touched.brandType && formik.errors.brandType
                            ? "border-danger"
                            : "border-white/08"
                        }`}
                      />
                      <ErrorMessage name="brandType" />
                    </div> */}
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        Brand Type
                      </label>
                      <div className="relative">
                        <select
                          name="brandType"
                          value={formik.values.brandType}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full px-4 py-2.5 pr-10 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent appearance-none cursor-pointer ${
                            formik.touched.brandType && formik.errors.brandType
                              ? "border-danger"
                              : "border-white/08"
                          }`}
                        >
                          <option value="">Select Brand Type</option>
                          {productTypeEnum?.map((brand, index) => (
                            <option key={index} value={brand.value}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        />
                      </div>
                      <ErrorMessage name="brandType" />
                    </div>

                    {/* Product Type */}
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        Product Type
                      </label>
                      <div className="relative">
                        <select
                          name="productType"
                          value={formik.values.productType}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full px-4 py-2.5 pr-10 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent appearance-none cursor-pointer ${
                            formik.touched.productType &&
                            formik.errors.productType
                              ? "border-danger"
                              : "border-white/08"
                          }`}
                        >
                          <option value="">Select Product Type</option>
                          {productTypeEnum?.map((product, index) => (
                            <option key={index} value={product.value}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        />
                      </div>
                      <ErrorMessage name="productType" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Provide a detailed product description..."
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      rows={4}
                      className={`w-full px-4 py-3 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent resize-none ${
                        formik.touched.description && formik.errors.description
                          ? "border-danger"
                          : "border-white/08"
                      }`}
                    />
                    <ErrorMessage name="description" />
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      placeholder="Provide a brief product summary..."
                      value={formik.values.shortDescription}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      rows={2}
                      className={`w-full px-4 py-3 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent resize-none ${
                        formik.touched.shortDescription &&
                        formik.errors.shortDescription
                          ? "border-danger"
                          : "border-white/08"
                      }`}
                    />
                    <ErrorMessage name="shortDescription" />
                  </div>
                </div>

                {/* Inventory & Pricing Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src="/assets/svgs/vendor/inventory/addNewProduct/inventoryPricing.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                    <h3 className="font-manrope text-[14px] font-bold text-white">
                      Inventory & Pricing
                    </h3>
                  </div>

                  {/* Warehouse, Initial Quantity, Reorder Point Row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Warehouse Location */}
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        Warehouse Location
                      </label>
                      <div className="relative">
                        <select
                          name="warehouseLocation"
                          value={formik.values.warehouseLocation}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-4 py-2.5 pr-10 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent appearance-none cursor-pointer"
                        >
                          <option value="">Select Warehouse</option>
                          <option value="warehouse-a">Warehouse A</option>
                          <option value="warehouse-b">Warehouse B</option>
                          <option value="warehouse-c">Warehouse C</option>
                          <option value="warehouse-d">Warehouse D</option>
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Initial Quantity */}
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        Initial Quantity
                      </label>
                      <input
                        type="number"
                        name="initialQuantity"
                        min="0"
                        placeholder="0"
                        value={formik.values.initialQuantity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent ${
                          formik.touched.initialQuantity &&
                          formik.errors.initialQuantity
                            ? "border-danger"
                            : "border-white/08"
                        }`}
                      />
                      <ErrorMessage name="initialQuantity" />
                    </div>

                    {/* Reorder Point */}
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        Reorder Point
                      </label>
                      <input
                        type="number"
                        name="reorderPoint"
                        min="0"
                        placeholder="10"
                        value={formik.values.reorderPoint}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent ${
                          formik.touched.reorderPoint &&
                          formik.errors.reorderPoint
                            ? "border-danger"
                            : "border-white/08"
                        }`}
                      />
                      <ErrorMessage name="reorderPoint" />
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="mb-4">
                    <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                      Unit Price ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-manrope text-[13px]">
                        $
                      </span>
                      <input
                        type="number"
                        name="unitPrice"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formik.values.unitPrice}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full pl-8 pr-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent ${
                          formik.touched.unitPrice && formik.errors.unitPrice
                            ? "border-danger"
                            : "border-white/08"
                        }`}
                      />
                    </div>
                    <ErrorMessage name="unitPrice" />
                  </div>

                  {/* Toggles Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Is Active Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white/05 border border-white/08 rounded-lg">
                      <label className="font-manrope text-[13px] font-medium text-white cursor-pointer">
                        Active
                      </label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formik.values.isActive}
                        onChange={formik.handleChange}
                        className="w-4 h-4 text-white bg-surface-raised border-white/10 rounded focus:ring-2 focus:ring-accent/40 cursor-pointer"
                      />
                    </div>

                    {/* Track Inventory Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white/05 border border-white/08 rounded-lg">
                      <label className="font-manrope text-[13px] font-medium text-white cursor-pointer">
                        Track Inventory
                      </label>
                      <input
                        type="checkbox"
                        name="trackInventory"
                        checked={formik.values.trackInventory}
                        onChange={formik.handleChange}
                        className="w-4 h-4 text-white bg-surface-raised border-white/10 rounded focus:ring-2 focus:ring-accent/40 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Images Section */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src="/assets/svgs/vendor/inventory/addNewProduct/productImages.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                    <h3 className="font-manrope text-[14px] font-bold text-white">
                      Product Images
                    </h3>
                  </div>

                  {/* Upload Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      relative border-[1.19px] border-dashed rounded-[7.15px] p-12 text-center
                      transition-colors cursor-pointer bg-white/08
                      ${
                        dragActive
                          ? "border-white/10"
                          : "border-white/10 hover:border-white/20"
                      }
                    `}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src="/assets/svgs/vendor/inventory/addNewProduct/clickToUpload.svg"
                        alt=""
                        width={48}
                        height={48}
                      />
                      <div>
                        <p className="font-manrope text-[14px] font-medium text-white mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="font-manrope text-[12px] text-muted">
                          PNG, JPG or WEBP (Max. 800×400px)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {formik.values.productImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {formik.values.productImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border border-white/08"
                        >
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-danger-solid text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[16px] px-2 py-1 truncate">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-white/08 flex items-center justify-end gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] font-medium text-muted hover:bg-white/05 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  disabled={isLoading || !formik.isValid}
                  className="px-6 py-2.5 bg-surface-raised text-white rounded-lg font-manrope text-[13px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isLoading ? "Adding..." : "Add Product"}
                </motion.button>
              </div>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
