import * as Yup from "yup";

/**
 * Admin portfolio project.
 *
 * Mirrors `AdminCreatePortfolioProjectDto`. Every field on that DTO is
 * `nullable: true` and the schema declares no `required` list — which per
 * CLAUDE.md means "the spec is silent", not "safe to omit". A showcase entry
 * with no title or no description is useless on the public page regardless of
 * what the backend will accept, so the required set here is a product decision.
 *
 * `budgetMin`/`budgetMax` and the duration pair are genuinely optional: the
 * live data has them null on every seeded project and renders "On Request".
 */
export const portfolioProjectSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(6, "Give the project a descriptive title")
    .max(160, "Title cannot exceed 160 characters")
    .required("Title is required"),

  vendorName: Yup.string()
    .trim()
    .max(80, "Vendor name cannot exceed 80 characters")
    .required("Vendor name is required"),

  location: Yup.string()
    .trim()
    .max(120, "Location cannot exceed 120 characters")
    .required("Location is required"),

  category: Yup.string()
    .trim()
    .max(120, "Category cannot exceed 120 characters")
    .required("Category is required"),

  description: Yup.string()
    .trim()
    .min(40, "Describe the project properly — at least 40 characters")
    .max(4000, "Description cannot exceed 4000 characters")
    .required("Description is required"),

  scopeOfWork: Yup.string()
    .trim()
    .required("List at least one scope item, one per line"),

  // Empty string is the "not set" value from a number input, and must survive
  // validation — `Yup.number()` alone casts "" to NaN and fails.
  budgetMin: Yup.number()
    .transform((value, original) => (original === "" ? null : value))
    .nullable()
    .min(0, "Budget cannot be negative"),

  budgetMax: Yup.number()
    .transform((value, original) => (original === "" ? null : value))
    .nullable()
    .min(0, "Budget cannot be negative")
    .test(
      "above-min",
      "Maximum budget must be at least the minimum",
      function (value) {
        const { budgetMin } = this.parent;
        if (value == null || budgetMin == null || budgetMin === "") return true;
        return Number(value) >= Number(budgetMin);
      },
    ),

  durationMinDays: Yup.number()
    .transform((value, original) => (original === "" ? null : value))
    .nullable()
    .integer("Enter whole days")
    .min(1, "Duration must be at least a day"),

  durationMaxDays: Yup.number()
    .transform((value, original) => (original === "" ? null : value))
    .nullable()
    .integer("Enter whole days")
    .min(1, "Duration must be at least a day")
    .test(
      "above-min",
      "Maximum duration must be at least the minimum",
      function (value) {
        const { durationMinDays } = this.parent;
        if (value == null || durationMinDays == null || durationMinDays === "")
          return true;
        return Number(value) >= Number(durationMinDays);
      },
    ),
});
