// lib/api/schemas/ai.ts
//
// SERVER-ONLY. See the header of ./common.ts.
//
// Response shapes for the AI generation surface. Recorded from the live backend
// — the OpenAPI document declares every operation as a bare `200: OK`.

import { z } from "zod";

/**
 * One selectable design style. `id` is a slug ("modern", "wabi-sabi"); it is
 * the value the `style` field on GenerateImageDto / GenerateVideoDto expects.
 * `name` is the display label.
 */
export const aiStyleSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
});

/** GET /ai/styles → a bare array, no envelope. */
export const aiStylesResponse = z.array(aiStyleSchema);

/**
 * POST /ai/renovation/estimate response — observed live 2026-08-25
 * (contracts/renovation-estimate.json). No envelope. `projectId` is nullable
 * — null when the estimate isn't filed under a project, which is the only
 * case observed (the request sent `projectId: null`). No DELETE endpoint
 * exists for a renovation estimate, so that call left one permanent row in
 * the dev database, name-prefixed "Contract Recorder Test Estimate".
 */
export const renovationEstimateLineItemSchema = z.looseObject({
  group: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  unitCost: z.number(),
  totalCost: z.number(),
});

export const renovationEstimateSuggestedProductSchema = z.looseObject({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  link: z.string(),
});

export const renovationEstimateNextStepSchema = z.looseObject({
  label: z.string(),
  url: z.string(),
  method: z.string(),
});

export const renovationEstimatePaymentPlanSchema = z.looseObject({
  name: z.string(),
  installments: z.number(),
  perInstallment: z.number(),
  description: z.string(),
});

export const renovationEstimateResponse = z.looseObject({
  estimateId: z.string(),
  projectId: z.string().nullable(),
  projectName: z.string(),
  roomType: z.string(),
  createdAtUtc: z.string(),
  floorAreaSqm: z.number(),
  wallAreaSqm: z.number(),
  currency: z.string(),
  finishLevel: z.string(),
  materialsSubtotal: z.number(),
  laborSubtotal: z.number(),
  contingencyAmount: z.number(),
  totalEstimate: z.number(),
  summary: z.string(),
  status: z.string(),
  lineItems: z.array(renovationEstimateLineItemSchema),
  suggestedProducts: z.array(renovationEstimateSuggestedProductSchema),
  nextSteps: z.array(renovationEstimateNextStepSchema),
  paymentPlanOptions: z.array(renovationEstimatePaymentPlanSchema),
});
