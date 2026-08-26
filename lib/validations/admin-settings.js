import * as Yup from "yup";

/**
 * Payment Settings Validation Schema
 */
export const paymentSettingsSchema = Yup.object().shape({
  basePlatformFee: Yup.number()
    .min(0, "Base fee cannot be negative")
    .max(100, "Base fee cannot exceed 100%")
    .required("Base platform fee is required"),

  fixedFeePerTransaction: Yup.number()
    .min(0, "Fixed fee cannot be negative")
    .max(1000, "Fixed fee seems too high")
    .required("Fixed fee is required"),

  defaultCurrency: Yup.string()
    .oneOf(["USD", "EUR", "GBP", "NGN", "KES", "ZAR"], "Invalid currency")
    .required("Currency is required"),

  gateways: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      enabled: Yup.boolean().required(),
      publicKey: Yup.string().when("enabled", {
        is: true,
        then: (schema) => schema.required("Public key is required when gateway is enabled"),
        otherwise: (schema) => schema,
      }),
      secretKey: Yup.string().when("enabled", {
        is: true,
        then: (schema) => schema.required("Secret key is required when gateway is enabled"),
        otherwise: (schema) => schema,
      }),
    })
  ),
});

/**
 * AI Settings Validation Schema
 */
export const aiSettingsSchema = Yup.object().shape({
  defaultModel: Yup.string()
    .oneOf(["gpt-4", "gpt-3.5-turbo", "claude-3", "llama-2"], "Invalid AI model")
    .required("Default AI model is required"),

  temperature: Yup.number()
    .min(0, "Temperature must be between 0 and 2")
    .max(2, "Temperature must be between 0 and 2")
    .required("Temperature is required"),

  maxTokens: Yup.number()
    .min(1, "Max tokens must be at least 1")
    .max(32000, "Max tokens cannot exceed 32000")
    .required("Max tokens is required"),

  apiKey: Yup.string()
    .min(10, "API key seems too short")
    .required("API key is required"),

  models: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      enabled: Yup.boolean().required(),
      name: Yup.string().required(),
    })
  ),
});

/**
 * General Settings Validation Schema
 */
export const generalSettingsSchema = Yup.object().shape({
  siteName: Yup.string()
    .min(2, "Site name must be at least 2 characters")
    .max(100, "Site name cannot exceed 100 characters")
    .required("Site name is required"),

  siteDescription: Yup.string()
    .max(500, "Description cannot exceed 500 characters"),

  adminEmail: Yup.string()
    .email("Invalid email address")
    .required("Admin email is required"),

  timezone: Yup.string()
    .required("Timezone is required"),

  maintenanceMode: Yup.boolean(),

  enableNotifications: Yup.boolean(),

  maxUploadSize: Yup.number()
    .min(1, "Upload size must be at least 1 MB")
    .max(100, "Upload size cannot exceed 100 MB")
    .required("Max upload size is required"),
});

/**
 * Gateway Credentials Validation Schema
 */
export const gatewayCredentialsSchema = Yup.object().shape({
  publicKey: Yup.string()
    .min(10, "Public key seems too short")
    .required("Public key is required"),

  secretKey: Yup.string()
    .min(10, "Secret key seems too short")
    .required("Secret key is required"),
});

/**
 * Admin User Validation Schema
 */
export const adminUserSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),

  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .required("First name is required"),

  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .required("Last name is required"),

  role: Yup.string()
    .oneOf(["admin", "super-admin", "moderator"], "Invalid role")
    .required("Role is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number and special character"
    )
    .when("isEditing", {
      is: false,
      then: (schema) => schema.required("Password is required"),
      otherwise: (schema) => schema,
    }),
});

/**
 * Order Management Validation Schema
 */
export const orderActionSchema = Yup.object().shape({
  orderId: Yup.string().required("Order ID is required"),

  status: Yup.string()
    .oneOf(
      ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"],
      "Invalid status"
    ),

  reason: Yup.string().when(["status"], {
    is: (status) => ["Cancelled", "Refunded"].includes(status),
    then: (schema) =>
      schema
        .min(10, "Reason must be at least 10 characters")
        .max(500, "Reason cannot exceed 500 characters")
        .required("Reason is required for cancellation/refund"),
    otherwise: (schema) => schema,
  }),

  trackingNumber: Yup.string().when("status", {
    is: "Shipped",
    then: (schema) =>
      schema
        .matches(/^[A-Z0-9-]+$/, "Invalid tracking number format")
        .required("Tracking number is required for shipped orders"),
    otherwise: (schema) => schema,
  }),
});
