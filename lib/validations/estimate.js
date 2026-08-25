import * as Yup from "yup";

/**
 * "Get Estimate" from a design card, POST /ai/renovation/estimate. A Design
 * carries no dimensions (only its design session did, and that's already
 * gone by the time it's a saved design), so length/width/height always start
 * blank — see lib/api/schemas/ai.ts.
 */
export const FINISH_LEVELS = ["Standard", "Premium", "Luxury"];

export const renovationEstimateSchema = Yup.object().shape({
  roomType: Yup.string().trim().required("Room type is required"),

  lengthMeters: Yup.number()
    .typeError("Enter a number")
    .positive("Must be greater than 0")
    .max(100, "That doesn't look like a room")
    .required("Length is required"),

  widthMeters: Yup.number()
    .typeError("Enter a number")
    .positive("Must be greater than 0")
    .max(100, "That doesn't look like a room")
    .required("Width is required"),

  heightMeters: Yup.number()
    .typeError("Enter a number")
    .positive("Must be greater than 0")
    .max(10, "That doesn't look like a room")
    .required("Height is required"),

  finishLevel: Yup.string().oneOf(FINISH_LEVELS).required("Choose a finish level"),

  includeFlooring: Yup.boolean(),
  includePainting: Yup.boolean(),
  includeElectrical: Yup.boolean(),
  includePlumbing: Yup.boolean(),

  contingencyPercent: Yup.number()
    .typeError("Enter a number")
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%")
    .required("Contingency is required"),
});
