import * as Yup from "yup";

/**
 * Admin edit of one consultation pricing row —
 * `Consultations.UpdateConsultationPricingConfigRequestDto`
 * (docs/api/tbm-backend-api.md). Every field is sent on save, so every field
 * is validated, even the ones the form does not let you change.
 */
export const consultationPricingSchema = Yup.object().shape({
  fee: Yup.number()
    .typeError("Enter the fee as a number")
    .min(0, "A fee cannot be negative")
    .required("Enter a fee (0 makes the consultation free)"),
  currency: Yup.string().trim().length(3, "Use a 3-letter currency code").required(),
  creditedTowardProject: Yup.boolean().required(),
  isActive: Yup.boolean().required(),
});

/** `Consultations.CancelConsultationRequestDto` */
export const cancelConsultationSchema = Yup.object().shape({
  reason: Yup.string()
    .trim()
    .min(5, "Give the customer a reason they can act on")
    .max(500, "Keep the reason under 500 characters")
    .required("A reason is required — the customer sees it"),
});
