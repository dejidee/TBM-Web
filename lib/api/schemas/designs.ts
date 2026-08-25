// lib/api/schemas/designs.ts
//
// SERVER-ONLY. See the header of ./common.ts.
//
// Every shape here was observed live on 2026-08-25 against the dev backend
// (contracts/designs.json, contracts/designs-detail.json) — not reconstructed
// from the spec, which declares all seven Designs operations as a bare
// `200: OK`. Three things the spec cannot tell you, and the list/card code
// guessed wrong about until then:
//
//   - GET /Designs is NOT enveloped: `{ designs, pagination }`, with the
//     `page/limit/total/hasMore` pagination of /flooring, not `data.items`.
//     The default `limit` is 10, and `pageSize` is silently ignored.
//   - The list item carries `url`; the detail carries `outputUrl` plus
//     `width`/`height`/`durationSeconds`. Same design, two field names.
//   - There is no `name`, `title`, `projectName`, `isFavorited`, `room` or
//     `isHighRes`. The heading is `prompt`; the flag is `isFavorite`.

import { z } from "zod";
import { listPaginationSchema } from "./common";

/**
 * One row from GET /Designs.
 *
 * `roomType` is derived by the backend (the studio never sends one) and is
 * lower-case free text — observed `"living room"` and null. `outputType` was
 * `"Image"` on every observed row; the studio can also request a video tour,
 * so a `"Video"` row is expected but has not been seen. Render on the value,
 * don't switch on a closed set.
 */
export const designSchema = z.looseObject({
  id: z.string(),
  projectId: z.string(),
  roomType: z.string().nullable(),
  prompt: z.string(),
  url: z.string(),
  outputType: z.string(),
  createdAt: z.string(),
  isFavorite: z.boolean(),
});

/**
 * GET /Designs — no envelope.
 *
 * `roomType` (case-insensitive exact match), `search` (matches `prompt`),
 * `page`, `limit`, and `sortBy=newest|oldest` are honoured server-side.
 * `sortBy=favorites` and `sortBy=alphabetical` return 200 and are ignored —
 * confirmed by toggling a favourite and re-fetching. Sort those client-side.
 */
export const designListResponse = z.looseObject({
  designs: z.array(designSchema),
  pagination: listPaginationSchema,
});

/**
 * GET /Designs/{id} — no envelope, and not the list row: the image is
 * `outputUrl` here. `durationSeconds` was null on the (image) design observed;
 * it presumably fills in for a video. Widen off real data.
 */
export const designDetailSchema = z.looseObject({
  id: z.string(),
  projectId: z.string(),
  outputUrl: z.string(),
  outputType: z.string(),
  width: z.number(),
  height: z.number(),
  durationSeconds: z.unknown(),
  prompt: z.string(),
  roomType: z.string().nullable(),
  isFavorite: z.boolean(),
  createdAt: z.string(),
});
export const designResponse = designDetailSchema;

/** GET /Designs/{id}/download[?quality=] — no envelope. Same shape with and without `quality`. */
export const designDownloadResponse = z.looseObject({
  success: z.boolean(),
  downloadUrl: z.string(),
});

/** POST /Designs/{id}/favorite — no envelope. Toggles, and answers with the new state. */
export const designFavoriteResponse = z.looseObject({
  success: z.boolean(),
  isFavorite: z.boolean(),
});
