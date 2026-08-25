// lib/api/schemas/projects.ts
//
// SERVER-ONLY. See the header of ./common.ts.
//
// Only POST /projects is modelled — it's the only Projects operation this app
// calls today (from the "make into a project" design-card action). The
// response was observed live on 2026-08-25 (contracts/projects-create.json):
// there is no DELETE /projects/{id}, so that call left one permanent row in
// the dev database, name-prefixed "Contract Recorder Test Project".

import { z } from "zod";
import { envelope } from "./common";

/**
 * `designSessionId`, `orderId`, `bomId`, and `vendorId` were null on the
 * observed project — a project created directly via POST /projects, not
 * derived from a design session or an order. Widen off real data once one of
 * those paths has been observed.
 */
export const projectSchema = z.looseObject({
  id: z.string(),
  projectNumber: z.string(),
  userId: z.string(),
  designSessionId: z.unknown(),
  orderId: z.unknown(),
  bomId: z.unknown(),
  vendorId: z.unknown(),
  name: z.string(),
  description: z.string(),
  roomType: z.string(),
  status: z.string(),
  startDate: z.string(),
  expectedCompletionDate: z.unknown(),
  actualCompletionDate: z.unknown(),
  financial: z.looseObject({
    totalBudget: z.number(),
    amountPaid: z.number(),
    amountPending: z.number(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** POST /projects — enveloped, unlike the un-enveloped Designs endpoints. */
export const createProjectResponse = envelope(projectSchema);
