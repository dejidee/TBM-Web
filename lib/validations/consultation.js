import * as Yup from "yup";

import { PROPERTY_TYPES } from "@/lib/api/consultations";

/**
 * Nigerian mobile numbers, the three forms people actually type:
 *   0803 123 4567 · +234 803 123 4567 · 234 803 123 4567
 * Spaces, dashes and brackets are stripped before the test, so the user is
 * never told off for formatting their own phone number.
 */
const PHONE_PATTERN = /^(\+?234|0)[789][01]\d{8}$/;

/**
 * Consultation booking, rebuilt against the real `Consultations` DTO
 * (BACKLOG.md — was against an invented client-side taxonomy before).
 *
 * `typeKey` and `scheduledStart` are chosen from real backend data (types,
 * availability) rather than free-typed, so they're validated as "must be
 * set" rather than "must match a pattern". Location is required even for a
 * video consultation — carried over from the original design: it still
 * determines which team and rates apply, even when nobody travels.
 */
export const consultationSchema = Yup.object().shape({
  typeKey: Yup.string().required("Choose a consultation type"),

  propertyType: Yup.string()
    .oneOf(PROPERTY_TYPES, "Choose one of the listed property types")
    .required("Select your property type"),

  contactName: Yup.string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Name cannot exceed 100 characters")
    .required("Full name is required"),

  contactEmail: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  contactPhone: Yup.string()
    .transform((value) =>
      typeof value === "string" ? value.replace(/[\s()-]/g, "") : value,
    )
    .matches(PHONE_PATTERN, "Enter a valid Nigerian phone number")
    .required("Phone number is required"),

  siteAddress: Yup.string()
    .trim()
    .min(5, "Enter the street address")
    .max(250, "Address cannot exceed 250 characters")
    .required("Location is required"),

  siteCity: Yup.string()
    .trim()
    .min(2, "Enter the city or area")
    .max(80, "City cannot exceed 80 characters")
    .required("City is required"),

  siteState: Yup.string().trim().required("State is required"),

  scheduledStart: Yup.string().required("Choose an available time"),

  notes: Yup.string().trim().max(2000, "Notes cannot exceed 2000 characters"),
});
