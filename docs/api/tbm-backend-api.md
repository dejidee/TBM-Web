# TBM Backend API — endpoint & payload reference

- **Source:** [`https://tbmdev-001-site1.dtempurl.com/swagger/v1/swagger.json`](https://tbmdev-001-site1.dtempurl.com/swagger/v1/swagger.json) (Swagger UI: `/index.html`)
- **Spec:** OpenAPI 3.0.1 · `TBM BUILDING AI VISUALIZER API` · version `v1`
- **Snapshot taken:** 2026-08-22
- **Size:** 275 paths · 324 operations · 177 object schemas · 10 enums

Regenerate with `node scripts/gen-api-doc.mjs` after re-downloading the spec
above; this file is a snapshot, not a live view.

## Read this first — what the spec does *not* tell you

This document is only as good as the spec, and the spec has real gaps. Every one
of them is a place where you must read the backend or observe a live response
rather than trust this file.

- **There are no response schemas.** All 324 operations declare exactly one
  response, a bare `200: OK`, with no body type. The spec describes *requests
  only*. This is the documented reason response shapes are guessed at call sites
  in this repo (`json.data ?? json`) — Swagger cannot resolve it for you.
- **No error responses are declared.** No 400, 401, 404, 409, 500. Their bodies
  are undocumented.
- **No summaries or descriptions.** Not one operation carries prose. Endpoint
  intent has to be inferred from its path, tag, and request payload.
- **Enums are bare integers.** The spec gives the numeric values but not their
  names, so `OrderStatus: 3` is undecodable from here. See [Enums](#enums).
- **Almost nothing is marked required.** Exactly 7 of the 187 schemas declares a
  `required` list, and nearly every property is `nullable: true`. Treat
  "optional" in this doc as "unknown", not as "safe to omit".
- **This is the dev instance, fetched unauthenticated.** Endpoints hidden from
  the public document are not here.

## Calling these endpoints from this app

The browser never learns the backend URL and never holds a token. See `CLAUDE.md`.

`API_URL` already ends in `/api/v1`, and `next.config.mjs` rewrites `/api/v1/:path*`
to the proxy — so **spec paths map 1:1 onto client fetch paths**:

```js
// spec: GET /api/v1/cart
fetch("/api/v1/cart")   // → /api/proxy/v1/cart → API_URL + /cart
```

Admin endpoints live at `/api/v1/admin/**` in the spec. Reaching them with the
**admin** cookie (`adminAuthToken`) means going through the admin mount, which is
*not* covered by the rewrite:

```js
// spec: GET /api/v1/admin/AdminUsers
fetch("/api/proxy/admin/admin/AdminUsers")   // → ADMIN_API_URL + /admin/AdminUsers
```

The doubled `admin/` is not a typo: the mount name is one, the backend path
segment is the other. Do not add a bespoke route handler in `app/api/` unless you
must transform the request or response.

**Two routes fall outside `/api/v1` and therefore outside the rewrite:**
`GET /auth/google` and `GET /auth/apple`. Both take no parameters and no body,
which is the shape of an OAuth redirect entry point rather than a JSON endpoint —
but the spec does not say so, and neither is reachable through the relative-path
proxy. Confirm intended usage against the backend before wiring either one up.

## Authentication

A single global security scheme applies to **every** operation in the spec:

| Scheme | Type | In | Header |
| --- | --- | --- | --- |
| `Bearer` | apiKey | header | `Authorization: Bearer <token>` |

No operation opts out, so **the spec cannot tell you which endpoints are public**.
Some plainly are: `GET /api/v1/Products` and `GET /api/v1/Cart` both return `200`
to an unauthenticated caller, despite being marked secured. Assume nothing from
the security block; test the endpoint.

`lib/proxy.js` attaches the header server-side from the httpOnly cookie. You never
set it yourself, and the client's own `Authorization` header is not forwarded.

### Path casing

The spec mixes conventions: 69 of 275 paths carry a PascalCase segment
(`/api/v1/Cart`, `/api/v1/Products`, `/api/v1/admin/AdminUsers`) while the rest are
lowercase (`/api/v1/account/profile`, `/api/v1/orders`).

ASP.NET routing is case-insensitive, and the live API confirms it — `/api/v1/Cart`,
`/api/v1/cart`, and `/api/v1/CART` all answer `200`, while an unknown path 404s. So
existing lowercase call sites are not bugs. Paths below are reproduced exactly as
the spec declares them.

## Enums

Serialized as **integers**. Swashbuckle emitted the values without their names, so
the meanings below are unknown from the spec alone — confirm against the backend
`TBM.Core.Enums` source before relying on any mapping.

| Enum | Values |
| --- | --- |
| <a id="s-aigenerationtype"></a>`AIGenerationType` | `1`, `2` |
| <a id="s-aioutputtype"></a>`AIOutputType` | `1`, `2` |
| <a id="s-billingcycle"></a>`BillingCycle` | `0`, `1` |
| <a id="s-consultationtype"></a>`ConsultationType` | `0`, `1`, `2`, `3`, `4` |
| <a id="s-designsessiontier"></a>`DesignSessionTier` | `1`, `2` |
| <a id="s-orderstatus"></a>`OrderStatus` | `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7` |
| <a id="s-portfolioimagetype"></a>`PortfolioImageType` | `0`, `1`, `2` |
| <a id="s-portfoliostatus"></a>`PortfolioStatus` | `0`, `1`, `2` |
| <a id="s-subscriptiontier"></a>`SubscriptionTier` | `0`, `1`, `2` |
| <a id="s-userstatus"></a>`UserStatus` | `1`, `2`, `3` |

## Endpoints

324 operations across 49 tags. `Body` links to the payload schema.

| Tag | Ops |  | Tag | Ops |
| --- | --- | --- | --- | --- |
| [AI](#tag-ai) | 8 |  | [Categories](#tag-categories) | 7 |
| [AIAssistant](#tag-aiassistant) | 9 |  | [Checkout](#tag-checkout) | 4 |
| [AIRenovationEstimator](#tag-airenovationestimator) | 6 |  | [Consultations](#tag-consultations) | 11 |
| [AIUpload](#tag-aiupload) | 1 |  | [Contact](#tag-contact) | 1 |
| [Account](#tag-account) | 22 |  | [Dashboard](#tag-dashboard) | 5 |
| [AdminAI](#tag-adminai) | 4 |  | [DesignSessions](#tag-designsessions) | 7 |
| [AdminAnalytics](#tag-adminanalytics) | 3 |  | [Designs](#tag-designs) | 7 |
| [AdminAuth](#tag-adminauth) | 3 |  | [Inspection](#tag-inspection) | 10 |
| [AdminConsultations](#tag-adminconsultations) | 4 |  | [Inspiration](#tag-inspiration) | 1 |
| [AdminDashboard](#tag-admindashboard) | 7 |  | [Lookups](#tag-lookups) | 10 |
| [AdminDiscounts](#tag-admindiscounts) | 5 |  | [Orders](#tag-orders) | 7 |
| [AdminFinancial](#tag-adminfinancial) | 5 |  | [PaystackWebhook](#tag-paystackwebhook) | 1 |
| [AdminInspections](#tag-admininspections) | 12 |  | [Portfolio](#tag-portfolio) | 2 |
| [AdminObservability](#tag-adminobservability) | 2 |  | [Pricing](#tag-pricing) | 1 |
| [AdminOrders](#tag-adminorders) | 6 |  | [ProductReviews](#tag-productreviews) | 2 |
| [AdminPortfolio](#tag-adminportfolio) | 8 |  | [Products](#tag-products) | 16 |
| [AdminPricing](#tag-adminpricing) | 4 |  | [ProjectRequests](#tag-projectrequests) | 3 |
| [AdminProducts](#tag-adminproducts) | 10 |  | [Projects](#tag-projects) | 8 |
| [AdminProjectQuotations](#tag-adminprojectquotations) | 2 |  | [PublicProjects](#tag-publicprojects) | 1 |
| [AdminSettings](#tag-adminsettings) | 11 |  | [Saved](#tag-saved) | 7 |
| [AdminSystemLogs](#tag-adminsystemlogs) | 3 |  | [Subscription](#tag-subscription) | 6 |
| [AdminUsers](#tag-adminusers) | 9 |  | [Upload](#tag-upload) | 1 |
| [AdminVendors](#tag-adminvendors) | 4 |  | [Vendor](#tag-vendor) | 26 |
| [Auth](#tag-auth) | 15 |  | [VendorPortfolio](#tag-vendorportfolio) | 9 |
| [Cart](#tag-cart) | 8 |  |  |  |

### <a id="tag-ai"></a>AI

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/ai/credits/balance` | — | — |
| `POST` | `/api/v1/ai/generate/image` | — | [`AI.GenerateImageDto`](#s-ai-generateimagedto) |
| `POST` | `/api/v1/ai/generate/video` | — | [`AI.GenerateVideoDto`](#s-ai-generatevideodto) |
| `GET` | `/api/v1/ai/projects` | — | — |
| `POST` | `/api/v1/ai/projects` | — | [`AI.CreateAIProjectDto`](#s-ai-createaiprojectdto) |
| `GET` | `/api/v1/ai/styles` | — | — |
| `POST` | `/api/v1/ai/transform/image` | — | [`AI.GenerateImageDto`](#s-ai-generateimagedto) |
| `GET` | `/api/v1/ai/usage/summary` | `year?` integer *(query)*<br>`month?` integer *(query)* | — |

### <a id="tag-aiassistant"></a>AIAssistant

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/ai/assistant/health` | — | — |
| `POST` | `/api/v1/ai/assistant/message` | — | [`AI.AssistantMessageRequestDto`](#s-ai-assistantmessagerequestdto) |
| `GET` | `/api/v1/ai/assistant/sessions` | — | — |
| `DELETE` | `/api/v1/ai/assistant/sessions/{sessionId}` | `sessionId` string(uuid) *(path)* | — |
| `GET` | `/api/v1/ai/assistant/sessions/{sessionId}` | `sessionId` string(uuid) *(path)* | — |
| `PATCH` | `/api/v1/ai/assistant/tasks/{taskId}` | `taskId` string(uuid) *(path)* | [`AI.UpdateAssistantTaskStatusRequestDto`](#s-ai-updateassistanttaskstatusrequestdto) |
| `GET` | `/api/v1/ai/assistant/tool-actions/{actionId}` | `actionId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/ai/assistant/tool-actions/{actionId}/approval` | `actionId` string(uuid) *(path)* | [`AI.ApproveAssistantToolActionRequestDto`](#s-ai-approveassistanttoolactionrequestdto) |
| `POST` | `/api/v1/ai/assistant/tool-actions/{actionId}/execute` | `actionId` string(uuid) *(path)* | [`AI.ExecuteAssistantToolActionRequestDto`](#s-ai-executeassistanttoolactionrequestdto) |

### <a id="tag-airenovationestimator"></a>AIRenovationEstimator

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/ai/renovation-estimates` | — | — |
| `POST` | `/api/v1/ai/renovation-estimates` | — | [`AI.CreateRenovationEstimateRequestDto`](#s-ai-createrenovationestimaterequestdto) |
| `GET` | `/api/v1/ai/renovation-estimates/{estimateId}` | `estimateId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/ai/renovation/estimate` | — | [`AI.CreateRenovationEstimateRequestDto`](#s-ai-createrenovationestimaterequestdto) |
| `GET` | `/api/v1/ai/renovation/estimates` | — | — |
| `GET` | `/api/v1/ai/renovation/estimates/{estimateId}` | `estimateId` string(uuid) *(path)* | — |

### <a id="tag-aiupload"></a>AIUpload

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/ai/upload-room` | — | **multipart/form-data**<br>`file` |

### <a id="tag-account"></a>Account

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `DELETE` | `/api/v1/account` | — | [`AccountController.OptionalPasswordRequest`](#s-accountcontroller-optionalpasswordrequest) |
| `POST` | `/api/v1/account/addresses` | — | [`AccountController.AddressRequest`](#s-accountcontroller-addressrequest) |
| `DELETE` | `/api/v1/account/addresses/{addressId}` | `addressId` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/account/addresses/{addressId}` | `addressId` string(uuid) *(path)* | [`AccountController.AddressRequest`](#s-accountcontroller-addressrequest) |
| `PUT` | `/api/v1/account/addresses/{addressId}/default` | `addressId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/account/avatar` | — | **multipart/form-data**<br>`File` |
| `GET` | `/api/v1/account/brand-access` | — | — |
| `POST` | `/api/v1/account/deactivate` | — | [`AccountController.OptionalPasswordRequest`](#s-accountcontroller-optionalpasswordrequest) |
| `PUT` | `/api/v1/account/email` | — | [`AccountController.UpdateEmailRequest`](#s-accountcontroller-updateemailrequest) |
| `GET` | `/api/v1/account/me` | — | — |
| `PATCH` | `/api/v1/account/me` | — | [`AccountController.UpdateMeRequest`](#s-accountcontroller-updatemerequest) |
| `GET` | `/api/v1/account/notifications` | — | — |
| `PUT` | `/api/v1/account/notifications` | — | [`AccountController.NotificationPreferenceState`](#s-accountcontroller-notificationpreferencestate) |
| `PUT` | `/api/v1/account/password` | — | [`AccountController.UpdatePasswordRequest`](#s-accountcontroller-updatepasswordrequest) |
| `POST` | `/api/v1/account/password/change` | — | [`AccountController.ChangePasswordRequest`](#s-accountcontroller-changepasswordrequest) |
| `POST` | `/api/v1/account/password/otp/request` | — | [`AccountController.PasswordOtpRequest`](#s-accountcontroller-passwordotprequest) |
| `POST` | `/api/v1/account/password/otp/verify` | — | [`AccountController.VerifyPasswordOtpRequest`](#s-accountcontroller-verifypasswordotprequest) |
| `PUT` | `/api/v1/account/phone` | — | [`AccountController.UpdatePhoneRequest`](#s-accountcontroller-updatephonerequest) |
| `GET` | `/api/v1/account/profile` | — | — |
| `PUT` | `/api/v1/account/profile` | — | [`AccountController.UpdateProfileRequest`](#s-accountcontroller-updateprofilerequest) |
| `GET` | `/api/v1/account/security` | — | — |
| `PUT` | `/api/v1/account/security/2fa` | — | [`AccountController.UpdateTwoFactorRequest`](#s-accountcontroller-updatetwofactorrequest) |

### <a id="tag-adminai"></a>AdminAI

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/ai/credits/{userId}` | `userId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/admin/ai/credits/adjust` | — | [`AI.AICreditAdjustmentRequestDto`](#s-ai-aicreditadjustmentrequestdto) |
| `GET` | `/api/v1/admin/ai/usage/monthly-spend` | `months?` integer *(query)* | — |
| `GET` | `/api/v1/admin/ai/usage/user/{userId}` | `userId` string(uuid) *(path)*<br>`year?` integer *(query)*<br>`month?` integer *(query)* | — |

### <a id="tag-adminanalytics"></a>AdminAnalytics

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/analytics/monthly-revenue` | — | — |
| `GET` | `/api/v1/admin/analytics/overview` | — | — |
| `GET` | `/api/v1/admin/analytics/payment-distribution` | — | — |

### <a id="tag-adminauth"></a>AdminAuth

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/admin/auth/login` | — | [`Auth.AdminLoginDto`](#s-auth-adminlogindto) |
| `POST` | `/api/v1/admin/auth/logout` | — | [`Auth.RefreshTokenDto`](#s-auth-refreshtokendto) |
| `POST` | `/api/v1/admin/auth/refresh` | — | [`Auth.RefreshTokenDto`](#s-auth-refreshtokendto) |

### <a id="tag-adminconsultations"></a>AdminConsultations

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/consultations` | `status?` string *(query)*<br>`fromUtc?` string(date-time) *(query)*<br>`toUtc?` string(date-time) *(query)*<br>`page?` integer *(query)*<br>`pageSize?` integer *(query)* | — |
| `PUT` | `/api/v1/admin/consultations/{id}/cancel` | `id` string(uuid) *(path)* | [`Consultations.CancelConsultationRequestDto`](#s-consultations-cancelconsultationrequestdto) |
| `GET` | `/api/v1/admin/consultations/pricing` | — | — |
| `PUT` | `/api/v1/admin/consultations/pricing/{id}` | `id` string(uuid) *(path)* | [`Consultations.UpdateConsultationPricingConfigRequestDto`](#s-consultations-updateconsultationpricingconfigrequestdto) |

### <a id="tag-admindashboard"></a>AdminDashboard

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/dashboard/alerts` | — | — |
| `POST` | `/api/v1/admin/dashboard/export` | — | — |
| `GET` | `/api/v1/admin/dashboard/quick-actions` | — | — |
| `POST` | `/api/v1/admin/dashboard/refresh` | — | — |
| `GET` | `/api/v1/admin/dashboard/revenue` | `timeRange?` string *(query)* | — |
| `GET` | `/api/v1/admin/dashboard/server-load` | — | — |
| `GET` | `/api/v1/admin/dashboard/stats` | — | — |

### <a id="tag-admindiscounts"></a>AdminDiscounts

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/AdminDiscounts` | — | — |
| `POST` | `/api/v1/admin/AdminDiscounts` | — | [`Subscriptions.CreateDiscountDto`](#s-subscriptions-creatediscountdto) |
| `DELETE` | `/api/v1/admin/AdminDiscounts/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/admin/AdminDiscounts/{id}` | `id` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/admin/AdminDiscounts/{id}` | `id` string(uuid) *(path)* | [`Subscriptions.UpdateDiscountDto`](#s-subscriptions-updatediscountdto) |

### <a id="tag-adminfinancial"></a>AdminFinancial

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/financial/export` | `search?` string *(query)*<br>`filter?` string *(query)* | — |
| `GET` | `/api/v1/admin/financial/monthly-revenue` | `months?` integer *(query)* | — |
| `GET` | `/api/v1/admin/financial/revenue-by-service` | `dateRange?` string *(query)* | — |
| `GET` | `/api/v1/admin/financial/stats` | — | — |
| `GET` | `/api/v1/admin/financial/transactions` | `page?` integer *(query)*<br>`limit?` integer *(query)*<br>`search?` string *(query)*<br>`filter?` string *(query)* | — |

### <a id="tag-admininspections"></a>AdminInspections

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/inspections` | `status?` string *(query)*<br>`consultationType?` ConsultationType *(query)*<br>`from?` string(date-time) *(query)*<br>`to?` string(date-time) *(query)*<br>`state?` string *(query)* | — |
| `DELETE` | `/api/v1/admin/inspections/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/admin/inspections/{id}` | `id` string(uuid) *(path)* | — |
| `PATCH` | `/api/v1/admin/inspections/{id}/status` | `id` string(uuid) *(path)* | [`Inspections.UpdateInspectionStatusRequestDto`](#s-inspections-updateinspectionstatusrequestdto) |
| `GET` | `/api/v1/admin/inspections/availability/blocks` | `from?` string(date-time) *(query)*<br>`to?` string(date-time) *(query)*<br>`state?` string *(query)* | — |
| `POST` | `/api/v1/admin/inspections/availability/blocks` | — | [`Inspections.CreateInspectionAvailabilityBlockRequestDto`](#s-inspections-createinspectionavailabilityblockrequestdto) |
| `DELETE` | `/api/v1/admin/inspections/availability/blocks/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/admin/inspections/categories` | — | — |
| `GET` | `/api/v1/admin/inspections/pricing` | — | — |
| `POST` | `/api/v1/admin/inspections/pricing` | — | [`Inspections.CreateInspectionPricingConfigRequestDto`](#s-inspections-createinspectionpricingconfigrequestdto) |
| `DELETE` | `/api/v1/admin/inspections/pricing/{id}` | `id` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/admin/inspections/pricing/{id}` | `id` string(uuid) *(path)* | [`Inspections.UpdateInspectionPricingConfigRequestDto`](#s-inspections-updateinspectionpricingconfigrequestdto) |

### <a id="tag-adminobservability"></a>AdminObservability

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/observability/slo/{domain}` | `domain` string *(path)* | — |
| `GET` | `/api/v1/admin/observability/slo/overview` | — | — |

### <a id="tag-adminorders"></a>AdminOrders

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/orders` | `page?` integer *(query)*<br>`pageSize?` integer *(query)*<br>`status?` OrderStatus *(query)*<br>`search?` string *(query)* | — |
| `GET` | `/api/v1/admin/orders/{id}` | `id` string(uuid) *(path)* | — |
| `PATCH` | `/api/v1/admin/orders/{id}/cancel` | `id` string(uuid) *(path)* | inline string |
| `POST` | `/api/v1/admin/orders/{id}/refund` | `id` string(uuid) *(path)* | inline string |
| `PATCH` | `/api/v1/admin/orders/{id}/status` | `id` string(uuid) *(path)* | [`OrderStatus`](#s-orderstatus) |
| `PATCH` | `/api/v1/admin/orders/{id}/tracking` | `id` string(uuid) *(path)* | [`Admin.TrackingDto`](#s-admin-trackingdto) |

### <a id="tag-adminportfolio"></a>AdminPortfolio

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/AdminPortfolio` | `status?` PortfolioStatus *(query)*<br>`page?` integer *(query)*<br>`pageSize?` integer *(query)* | — |
| `POST` | `/api/v1/admin/AdminPortfolio` | — | [`Portfolio.AdminCreatePortfolioProjectDto`](#s-portfolio-admincreateportfolioprojectdto) |
| `DELETE` | `/api/v1/admin/AdminPortfolio/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/admin/AdminPortfolio/{id}` | `id` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/admin/AdminPortfolio/{id}` | `id` string(uuid) *(path)* | [`Portfolio.UpdatePortfolioProjectDto`](#s-portfolio-updateportfolioprojectdto) |
| `POST` | `/api/v1/admin/AdminPortfolio/{id}/images` | `id` string(uuid) *(path)*<br>`imageType?` PortfolioImageType *(query)*<br>`caption?` string *(query)* | **multipart/form-data**<br>`file` |
| `POST` | `/api/v1/admin/AdminPortfolio/{id}/publish` | `id` string(uuid) *(path)* | — |
| `PATCH` | `/api/v1/admin/AdminPortfolio/{id}/status` | `id` string(uuid) *(path)* | [`Portfolio.UpdatePortfolioStatusDto`](#s-portfolio-updateportfoliostatusdto) |

### <a id="tag-adminpricing"></a>AdminPricing

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/AdminPricing` | — | — |
| `GET` | `/api/v1/admin/AdminPricing/{tier}/{cycle}` | `tier` string *(path)*<br>`cycle` string *(path)* | — |
| `PUT` | `/api/v1/admin/AdminPricing/{tier}/{cycle}` | `tier` string *(path)*<br>`cycle` string *(path)* | [`Subscriptions.UpdatePricingConfigDto`](#s-subscriptions-updatepricingconfigdto) |
| `POST` | `/api/v1/admin/AdminPricing/seed` | — | — |

### <a id="tag-adminproducts"></a>AdminProducts

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/admin/AdminProducts` | — | [`Products.CreateProductDto`](#s-products-createproductdto) |
| `DELETE` | `/api/v1/admin/AdminProducts/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/admin/AdminProducts/{id}` | `id` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/admin/AdminProducts/{id}` | `id` string(uuid) *(path)* | [`Products.UpdateProductDto`](#s-products-updateproductdto) |
| `POST` | `/api/v1/admin/AdminProducts/{id}/images` | `id` string(uuid) *(path)* | [`Products.AddProductImageDto`](#s-products-addproductimagedto) |
| `PUT` | `/api/v1/admin/AdminProducts/{productId}/images/{imageId}/primary` | `productId` string(uuid) *(path)*<br>`imageId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/admin/AdminProducts/{productId}/images/upload` | `productId` string(uuid) *(path)*<br>`isPrimary?` boolean *(query)*<br>`displayOrder?` integer *(query)*<br>`altText?` string *(query)* | **multipart/form-data**<br>`file` |
| `POST` | `/api/v1/admin/AdminProducts/bulk` | — | inline [`Products.CreateProductDto`](#s-products-createproductdto)[] |
| `PUT` | `/api/v1/admin/AdminProducts/bulk` | — | inline [`Products.BulkUpdateProductItemDto`](#s-products-bulkupdateproductitemdto)[] |
| `DELETE` | `/api/v1/admin/AdminProducts/images/{imageId}` | `imageId` string(uuid) *(path)* | — |

### <a id="tag-adminprojectquotations"></a>AdminProjectQuotations

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/admin/projects/{projectId}/quotations` | `projectId` string(uuid) *(path)* | [`DesignFlow.CreateProjectQuotationRequestDto`](#s-designflow-createprojectquotationrequestdto) |
| `PUT` | `/api/v1/admin/projects/{projectId}/quotations/{quotationId}/status` | `projectId` string(uuid) *(path)*<br>`quotationId` string(uuid) *(path)* | [`DesignFlow.UpdateProjectQuotationStatusRequestDto`](#s-designflow-updateprojectquotationstatusrequestdto) |

### <a id="tag-adminsettings"></a>AdminSettings

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `PUT` | `/api/v1/admin/settings` | — | [`LegacyAdminSettingsFormDto`](#s-legacyadminsettingsformdto) |
| `GET` | `/api/v1/admin/settings/ai` | — | — |
| `PUT` | `/api/v1/admin/settings/ai` | — | [`Settings.AISettingsDto`](#s-settings-aisettingsdto) |
| `PATCH` | `/api/v1/admin/settings/ai/models/{modelId}` | `modelId` string *(path)* | [`Settings.ToggleEnabledDto`](#s-settings-toggleenableddto) |
| `GET` | `/api/v1/admin/settings/general` | — | — |
| `PUT` | `/api/v1/admin/settings/general` | — | [`Settings.GeneralSettingsDto`](#s-settings-generalsettingsdto) |
| `GET` | `/api/v1/admin/settings/notifications` | — | — |
| `PUT` | `/api/v1/admin/settings/notifications` | — | [`Settings.AdminNotificationSettingsDto`](#s-settings-adminnotificationsettingsdto) |
| `GET` | `/api/v1/admin/settings/payment` | — | — |
| `PUT` | `/api/v1/admin/settings/payment` | — | [`Settings.PaymentSettingsDto`](#s-settings-paymentsettingsdto) |
| `PATCH` | `/api/v1/admin/settings/payment/gateways/{gatewayId}` | `gatewayId` string *(path)* | [`Settings.ToggleEnabledDto`](#s-settings-toggleenableddto) |

### <a id="tag-adminsystemlogs"></a>AdminSystemLogs

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/system-logs` | `page?` integer *(query)*<br>`limit?` integer *(query)*<br>`search?` string *(query)*<br>`severity?` string *(query)*<br>`dateRange?` string *(query)* | — |
| `GET` | `/api/v1/admin/system-logs/export` | `severity?` string *(query)*<br>`search?` string *(query)*<br>`dateRange?` string *(query)* | — |
| `GET` | `/api/v1/admin/system-logs/stats` | `dateRange?` string *(query)* | — |

### <a id="tag-adminusers"></a>AdminUsers

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/users` | `page?` integer *(query)*<br>`limit?` integer *(query)*<br>`pageSize?` integer *(query)*<br>`search?` string *(query)*<br>`role?` string *(query)*<br>`status?` UserStatus *(query)* | — |
| `POST` | `/api/v1/admin/users` | — | [`Admin.AdminCreateUserRequestDto`](#s-admin-admincreateuserrequestdto) |
| `DELETE` | `/api/v1/admin/users/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/admin/users/{id}` | `id` string(uuid) *(path)* | — |
| `PATCH` | `/api/v1/admin/users/{id}/reactivate` | `id` string(uuid) *(path)* | — |
| `PATCH` | `/api/v1/admin/users/{id}/role` | `id` string(uuid) *(path)* | [`Admin.AdminUpdateUserRoleRequestDto`](#s-admin-adminupdateuserrolerequestdto) |
| `PATCH` | `/api/v1/admin/users/{id}/status` | `id` string(uuid) *(path)* | [`Admin.AdminUpdateUserStatusRequestDto`](#s-admin-adminupdateuserstatusrequestdto) |
| `PATCH` | `/api/v1/admin/users/{id}/suspend` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/admin/users/export` | — | — |

### <a id="tag-adminvendors"></a>AdminVendors

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/admin/vendors/{userId}/activate` | `userId` string(uuid) *(path)* | [`Vendor.ActivateVendorRequest`](#s-vendor-activatevendorrequest) |
| `GET` | `/api/v1/admin/vendors/{vendorUserId}/ownership` | `vendorUserId` string(uuid) *(path)* | — |
| `DELETE` | `/api/v1/admin/vendors/products/{productId}/assign` | `productId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/admin/vendors/products/{productId}/assign` | `productId` string(uuid) *(path)* | [`Vendor.AssignProductOwnerRequest`](#s-vendor-assignproductownerrequest) |

### <a id="tag-auth"></a>Auth

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/Auth/apple` | — | — |
| `POST` | `/api/v1/Auth/forgot-password` | — | [`Auth.ForgotPasswordDto`](#s-auth-forgotpassworddto) |
| `GET` | `/api/v1/Auth/google` | — | — |
| `POST` | `/api/v1/Auth/login` | — | [`Auth.LoginDto`](#s-auth-logindto) |
| `POST` | `/api/v1/Auth/logout` | — | — |
| `GET` | `/api/v1/Auth/me` | — | — |
| `GET` | `/api/v1/Auth/providers` | — | — |
| `POST` | `/api/v1/Auth/refresh-token` | — | [`Auth.RefreshTokenDto`](#s-auth-refreshtokendto) |
| `POST` | `/api/v1/Auth/register` | — | [`Auth.RegisterDto`](#s-auth-registerdto) |
| `POST` | `/api/v1/Auth/resend-verification` | — | [`Auth.ForgotPasswordDto`](#s-auth-forgotpassworddto) |
| `POST` | `/api/v1/Auth/reset-password` | — | [`Auth.ResetPasswordDto`](#s-auth-resetpassworddto) |
| `GET` | `/api/v1/Auth/verify-email` | `token?` string *(query)* | — |
| `POST` | `/api/v1/Auth/verify-email` | `token?` string *(query)* | — |
| `GET` | `/auth/apple` | — | — |
| `GET` | `/auth/google` | — | — |

### <a id="tag-cart"></a>Cart

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `DELETE` | `/api/v1/Cart` | — | — |
| `GET` | `/api/v1/Cart` | — | — |
| `POST` | `/api/v1/Cart/apply-promo` | — | [`Checkout.PromoValidationRequestDto`](#s-checkout-promovalidationrequestdto) |
| `POST` | `/api/v1/Cart/items` | — | [`Orders.AddToCartDto`](#s-orders-addtocartdto) |
| `DELETE` | `/api/v1/Cart/items/{itemId}` | `itemId` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/Cart/items/{itemId}` | `itemId` string(uuid) *(path)* | [`Orders.UpdateCartItemDto`](#s-orders-updatecartitemdto) |
| `POST` | `/api/v1/Cart/merge` | — | [`Orders.MergeCartRequestDto`](#s-orders-mergecartrequestdto) |
| `GET` | `/api/v1/Cart/related` | `limit?` integer *(query)* | — |

### <a id="tag-categories"></a>Categories

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/Categories` | — | — |
| `POST` | `/api/v1/Categories` | — | [`Products.CreateCategoryDto`](#s-products-createcategorydto) |
| `DELETE` | `/api/v1/Categories/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/Categories/{id}` | `id` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/Categories/{id}` | `id` string(uuid) *(path)* | [`Products.UpdateCategoryDto`](#s-products-updatecategorydto) |
| `GET` | `/api/v1/Categories/brand/{brandType}` | `brandType` integer *(path)* | — |
| `GET` | `/api/v1/Categories/slug/{slug}` | `slug` string *(path)* | — |

### <a id="tag-checkout"></a>Checkout

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/Checkout` | `promoCode?` string *(query)* | — |
| `POST` | `/api/v1/Checkout/payment` | — | [`Checkout.CheckoutPaymentRequestDto`](#s-checkout-checkoutpaymentrequestdto) |
| `GET` | `/api/v1/Checkout/payment/paystack/verify/{reference}` | `reference` string *(path)* | — |
| `POST` | `/api/v1/Checkout/validate-promo` | — | [`Checkout.PromoValidationRequestDto`](#s-checkout-promovalidationrequestdto) |

### <a id="tag-consultations"></a>Consultations

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/consultations` | — | [`Consultations.BookConsultationRequestDto`](#s-consultations-bookconsultationrequestdto) |
| `GET` | `/api/v1/consultations/{id}` | `id` string(uuid) *(path)*<br>`X-Consultation-Token?` string *(header)* | — |
| `POST` | `/api/v1/consultations/{id}/cancel` | `id` string(uuid) *(path)*<br>`X-Consultation-Token?` string *(header)* | [`Consultations.CancelConsultationRequestDto`](#s-consultations-cancelconsultationrequestdto) |
| `PUT` | `/api/v1/consultations/{id}/cancel` | `id` string(uuid) *(path)*<br>`X-Consultation-Token?` string *(header)* | [`Consultations.CancelConsultationRequestDto`](#s-consultations-cancelconsultationrequestdto) |
| `POST` | `/api/v1/consultations/{id}/initialize-payment` | `id` string(uuid) *(path)*<br>`X-Consultation-Token?` string *(header)* | [`Consultations.InitializeConsultationPaymentRequestDto`](#s-consultations-initializeconsultationpaymentrequestdto) |
| `PUT` | `/api/v1/consultations/{id}/reschedule` | `id` string(uuid) *(path)*<br>`X-Consultation-Token?` string *(header)* | [`Consultations.RescheduleConsultationRequestDto`](#s-consultations-rescheduleconsultationrequestdto) |
| `GET` | `/api/v1/consultations/availability` | `type?` string *(query)*<br>`date?` string(date) *(query)*<br>`startDate?` string(date) *(query)* | — |
| `POST` | `/api/v1/consultations/book` | — | [`Consultations.BookConsultationRequestDto`](#s-consultations-bookconsultationrequestdto) |
| `GET` | `/api/v1/consultations/mine` | — | — |
| `GET` | `/api/v1/consultations/types` | — | — |
| `POST` | `/api/v1/consultations/verify-payment` | — | [`Consultations.VerifyConsultationPaymentRequestDto`](#s-consultations-verifyconsultationpaymentrequestdto) |

### <a id="tag-contact"></a>Contact

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/contact` | — | [`Contact.CreateContactMessageDto`](#s-contact-createcontactmessagedto) |

### <a id="tag-dashboard"></a>Dashboard

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/Dashboard/consultations` | — | — |
| `GET` | `/api/v1/Dashboard/latest-design` | — | — |
| `GET` | `/api/v1/Dashboard/orders/{orderId}/tracking` | `orderId` string(uuid) *(path)* | — |
| `GET` | `/api/v1/Dashboard/recent-order` | — | — |
| `GET` | `/api/v1/Dashboard/saved-items` | — | — |

### <a id="tag-designsessions"></a>DesignSessions

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/designs/sessions` | — | — |
| `POST` | `/api/v1/designs/sessions` | — | [`DesignFlow.CreateDesignSessionRequestDto`](#s-designflow-createdesignsessionrequestdto) |
| `GET` | `/api/v1/designs/sessions/{sessionId}` | `sessionId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/designs/sessions/{sessionId}/add-to-cart` | `sessionId` string(uuid) *(path)* | [`DesignFlow.AddDesignSessionToCartRequestDto`](#s-designflow-adddesignsessiontocartrequestdto) |
| `POST` | `/api/v1/designs/sessions/{sessionId}/generate` | `sessionId` string(uuid) *(path)* | [`DesignFlow.GenerateDesignSessionRequestDto`](#s-designflow-generatedesignsessionrequestdto) |
| `GET` | `/api/v1/designs/sessions/{sessionId}/status` | `sessionId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/designs/sessions/{sessionId}/upload` | `sessionId` string(uuid) *(path)* | **multipart/form-data**<br>`Image` |

### <a id="tag-designs"></a>Designs

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/Designs` | `roomType?` string *(query)*<br>`search?` string *(query)*<br>`sortBy?` string *(query)*<br>`page?` integer *(query)*<br>`limit?` integer *(query)* | — |
| `DELETE` | `/api/v1/Designs/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/Designs/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/Designs/{id}/download` | `id` string(uuid) *(path)*<br>`quality?` string *(query)* | — |
| `POST` | `/api/v1/Designs/{id}/favorite` | `id` string(uuid) *(path)* | — |
| `POST` | `/api/v1/Designs/{id}/share` | `id` string(uuid) *(path)* | — |
| `PATCH` | `/api/v1/Designs/{id}/visibility` | `id` string(uuid) *(path)* | [`AI.UpdateDesignVisibilityDto`](#s-ai-updatedesignvisibilitydto) |

### <a id="tag-inspection"></a>Inspection

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/inspections/{id}` | `id` string(uuid) *(path)*<br>`X-Consultation-Token?` string *(header)* | — |
| `POST` | `/api/v1/inspections/{id}/cancel` | `id` string(uuid) *(path)*<br>`X-Consultation-Token?` string *(header)* | [`Inspections.CancelInspectionRequestDto`](#s-inspections-cancelinspectionrequestdto) |
| `POST` | `/api/v1/inspections/{id}/initialize-payment` | `id` string(uuid) *(path)* | [`Inspections.InitializeInspectionPaymentRequestDto`](#s-inspections-initializeinspectionpaymentrequestdto) |
| `POST` | `/api/v1/inspections/{id}/payment` | `id` string(uuid) *(path)* | [`Inspections.InitializeInspectionPaymentRequestDto`](#s-inspections-initializeinspectionpaymentrequestdto) |
| `PATCH` | `/api/v1/inspections/{id}/reschedule` | `id` string(uuid) *(path)*<br>`X-Consultation-Token?` string *(header)* | [`Inspections.RescheduleInspectionRequestDto`](#s-inspections-rescheduleinspectionrequestdto) |
| `GET` | `/api/v1/inspections/availability` | `consultationType?` ConsultationType *(query)*<br>`date?` string(date) *(query)*<br>`state?` string *(query)* | — |
| `POST` | `/api/v1/inspections/book` | — | [`Inspections.BookInspectionRequestDto`](#s-inspections-bookinspectionrequestdto) |
| `GET` | `/api/v1/inspections/fees` | — | — |
| `GET` | `/api/v1/inspections/mine` | — | — |
| `POST` | `/api/v1/inspections/verify-payment` | — | [`Inspections.VerifyInspectionPaymentRequestDto`](#s-inspections-verifyinspectionpaymentrequestdto) |

### <a id="tag-inspiration"></a>Inspiration

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/inspiration` | `category?` string *(query)*<br>`style?` string *(query)* | — |

### <a id="tag-lookups"></a>Lookups

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/lookups` | — | — |
| `GET` | `/api/v1/lookups/brand-types` | — | — |
| `GET` | `/api/v1/lookups/design-session-tiers` | — | — |
| `GET` | `/api/v1/lookups/material-types` | — | — |
| `GET` | `/api/v1/lookups/order-statuses` | — | — |
| `GET` | `/api/v1/lookups/payment-methods` | — | — |
| `GET` | `/api/v1/lookups/payment-statuses` | — | — |
| `GET` | `/api/v1/lookups/product-types` | — | — |
| `GET` | `/api/v1/lookups/project-statuses` | — | — |
| `GET` | `/api/v1/lookups/quality-tiers` | — | — |

### <a id="tag-orders"></a>Orders

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/orders` | — | [`Orders.CreateOrderDto`](#s-orders-createorderdto) |
| `GET` | `/api/v1/orders/{orderId}` | `orderId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/orders/{orderId}/cancel` | `orderId` string(uuid) *(path)* | [`Orders.CancelOrderDto`](#s-orders-cancelorderdto) |
| `GET` | `/api/v1/orders/{orderId}/invoice` | `orderId` string(uuid) *(path)* | — |
| `GET` | `/api/v1/orders/{orderId}/invoice/document` | `orderId` string(uuid) *(path)* | — |
| `GET` | `/api/v1/orders/my-orders` | — | — |
| `GET` | `/api/v1/orders/number/{orderNumber}` | `orderNumber` string *(path)* | — |

### <a id="tag-paystackwebhook"></a>PaystackWebhook

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/webhooks/paystack` | — | — |

### <a id="tag-portfolio"></a>Portfolio

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/portfolio` | `category?` string *(query)*<br>`location?` string *(query)*<br>`page?` integer *(query)*<br>`pageSize?` integer *(query)* | — |
| `GET` | `/api/v1/portfolio/{id}` | `id` string(uuid) *(path)* | — |

### <a id="tag-pricing"></a>Pricing

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/pricing` | `promoCode?` string *(query)* | — |

### <a id="tag-productreviews"></a>ProductReviews

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/products/{productId}/reviews` | `productId` string(uuid) *(path)*<br>`page?` integer *(query)*<br>`pageSize?` integer *(query)* | — |
| `POST` | `/api/v1/products/{productId}/reviews` | `productId` string(uuid) *(path)* | [`Products.CreateProductReviewDto`](#s-products-createproductreviewdto) |

### <a id="tag-products"></a>Products

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/flooring` | `category?` string *(query)*<br>`materialType?` string *(query)*<br>`minPrice?` number *(query)*<br>`maxPrice?` number *(query)*<br>`isFeatured?` boolean *(query)*<br>`sort?` string *(query)*<br>`page?` integer *(query)*<br>`limit?` integer *(query)* | — |
| `GET` | `/api/v1/materials` | `PageNumber?` integer *(query)*<br>`PageSize?` integer *(query)*<br>`BrandType?` integer *(query)*<br>`ProductType?` integer *(query)*<br>`CategoryId?` string(uuid) *(query)*<br>`SearchTerm?` string *(query)*<br>`MinPrice?` number *(query)*<br>`MaxPrice?` number *(query)*<br>`IsFeatured?` boolean *(query)*<br>`ActiveOnly?` boolean *(query)* | — |
| `GET` | `/api/v1/materials/{idOrSlug}` | `idOrSlug` string *(path)* | — |
| `GET` | `/api/v1/materials/list` | `category?` string *(query)*<br>`materialType?` string *(query)*<br>`minPrice?` number *(query)*<br>`maxPrice?` number *(query)*<br>`isFeatured?` boolean *(query)*<br>`sort?` string *(query)*<br>`page?` integer *(query)*<br>`limit?` integer *(query)* | — |
| `GET` | `/api/v1/Products` | `PageNumber?` integer *(query)*<br>`PageSize?` integer *(query)*<br>`BrandType?` integer *(query)*<br>`ProductType?` integer *(query)*<br>`CategoryId?` string(uuid) *(query)*<br>`SearchTerm?` string *(query)*<br>`MinPrice?` number *(query)*<br>`MaxPrice?` number *(query)*<br>`IsFeatured?` boolean *(query)*<br>`ActiveOnly?` boolean *(query)* | — |
| `POST` | `/api/v1/Products` | — | [`Products.CreateProductDto`](#s-products-createproductdto) |
| `DELETE` | `/api/v1/Products/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/Products/{id}` | `id` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/Products/{id}` | `id` string(uuid) *(path)* | [`Products.UpdateProductDto`](#s-products-updateproductdto) |
| `POST` | `/api/v1/Products/{id}/images` | `id` string(uuid) *(path)* | [`Products.AddProductImageDto`](#s-products-addproductimagedto) |
| `GET` | `/api/v1/Products/{id}/related` | `id` string(uuid) *(path)*<br>`limit?` integer *(query)* | — |
| `PUT` | `/api/v1/Products/{productId}/images/{imageId}/primary` | `productId` string(uuid) *(path)*<br>`imageId` string(uuid) *(path)* | — |
| `GET` | `/api/v1/Products/featured` | `brandType?` integer *(query)*<br>`limit?` integer *(query)* | — |
| `DELETE` | `/api/v1/Products/images/{imageId}` | `imageId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/Products/import` | — | **multipart/form-data**<br>`file` |
| `GET` | `/api/v1/Products/slug/{slug}` | `slug` string *(path)* | — |

### <a id="tag-projectrequests"></a>ProjectRequests

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/project-requests/3d-model` | — | [`ProjectRequests.CreateProjectRequestDto`](#s-projectrequests-createprojectrequestdto) |
| `POST` | `/api/v1/project-requests/boq` | — | [`ProjectRequests.CreateProjectRequestDto`](#s-projectrequests-createprojectrequestdto) |
| `POST` | `/api/v1/project-requests/contact-designer` | — | [`ProjectRequests.CreateProjectRequestDto`](#s-projectrequests-createprojectrequestdto) |

### <a id="tag-projects"></a>Projects

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/projects` | — | — |
| `POST` | `/api/v1/projects` | — | [`DesignFlow.CreateProjectRequestDto`](#s-designflow-createprojectrequestdto) |
| `GET` | `/api/v1/projects/{projectId}` | `projectId` string(uuid) *(path)* | — |
| `GET` | `/api/v1/projects/{projectId}/documents` | `projectId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/projects/{projectId}/documents` | `projectId` string(uuid) *(path)* | **multipart/form-data**<br>`File`<br>`Type`<br>`Name` |
| `GET` | `/api/v1/projects/{projectId}/gallery` | `projectId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/projects/{projectId}/gallery` | `projectId` string(uuid) *(path)* | **multipart/form-data**<br>`Image`<br>`Caption` |
| `GET` | `/api/v1/projects/{projectId}/timeline` | `projectId` string(uuid) *(path)* | — |

### <a id="tag-publicprojects"></a>PublicProjects

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/public/projects` | `page?` integer *(query)*<br>`limit?` integer *(query)*<br>`roomType?` string *(query)*<br>`search?` string *(query)*<br>`sort?` string *(query)* | — |

### <a id="tag-saved"></a>Saved

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/Saved` | `category?` string *(query)*<br>`search?` string *(query)*<br>`sortBy?` string *(query)*<br>`page?` integer *(query)*<br>`limit?` integer *(query)* | — |
| `POST` | `/api/v1/Saved` | — | [`SavedController.SaveItemRequest`](#s-savedcontroller-saveitemrequest) |
| `DELETE` | `/api/v1/Saved/{id}` | `id` string(uuid) *(path)* | — |
| `POST` | `/api/v1/Saved/{id}/add-to-cart` | `id` string(uuid) *(path)* | [`SavedController.AddSavedToCartRequest`](#s-savedcontroller-addsavedtocartrequest) |
| `POST` | `/api/v1/Saved/{id}/add-to-moodboard` | `id` string(uuid) *(path)* | [`SavedController.AddToMoodboardRequest`](#s-savedcontroller-addtomoodboardrequest) |
| `POST` | `/api/v1/Saved/buy-all` | — | [`SavedController.BuyAllRequest`](#s-savedcontroller-buyallrequest) |
| `POST` | `/api/v1/Saved/create-board` | — | [`SavedController.CreateBoardRequest`](#s-savedcontroller-createboardrequest) |

### <a id="tag-subscription"></a>Subscription

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/subscription/activate` | — | [`Subscriptions.ActivateSubscriptionDto`](#s-subscriptions-activatesubscriptiondto) |
| `POST` | `/api/v1/subscription/cancel` | — | — |
| `GET` | `/api/v1/subscription/current` | — | — |
| `POST` | `/api/v1/subscription/renew` | `callbackUrl?` string *(query)* | — |
| `POST` | `/api/v1/subscription/subscribe` | — | [`Subscriptions.SubscribeToPlanDto`](#s-subscriptions-subscribetoplandto) |
| `POST` | `/api/v1/subscription/upgrade` | — | [`Subscriptions.SubscribeToPlanDto`](#s-subscriptions-subscribetoplandto) |

### <a id="tag-upload"></a>Upload

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/uploads/document` | — | **multipart/form-data**<br>`file` |

### <a id="tag-vendor"></a>Vendor

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/inventory/products` | — | [`Vendor.VendorInventoryCreateRequest`](#s-vendor-vendorinventorycreaterequest) |
| `DELETE` | `/api/v1/inventory/products/{productId}` | `productId` string(uuid) *(path)* | — |
| `GET` | `/api/v1/inventory/stats` | — | — |
| `PUT` | `/api/v1/notifications/mark-all-read` | — | — |
| `GET` | `/api/v1/vendor/activity` | `filter?` string *(query)*<br>`page?` integer *(query)*<br>`pageSize?` integer *(query)* | — |
| `GET` | `/api/v1/vendor/alerts` | — | — |
| `GET` | `/api/v1/vendor/dashboard` | — | — |
| `GET` | `/api/v1/vendor/deliveries` | `page?` integer *(query)*<br>`pageSize?` integer *(query)*<br>`status?` OrderStatus *(query)* | — |
| `PATCH` | `/api/v1/vendor/deliveries/{orderId}` | `orderId` string(uuid) *(path)* | [`Vendor.VendorDeliveryUpdateRequest`](#s-vendor-vendordeliveryupdaterequest) |
| `GET` | `/api/v1/vendor/inventory` | `page?` integer *(query)*<br>`pageSize?` integer *(query)*<br>`search?` string *(query)*<br>`lowStockOnly?` boolean *(query)* | — |
| `PUT` | `/api/v1/vendor/inventory/{productId}` | `productId` string(uuid) *(path)* | [`Vendor.VendorInventoryUpdateRequest`](#s-vendor-vendorinventoryupdaterequest) |
| `POST` | `/api/v1/vendor/inventory/products` | — | [`Vendor.VendorInventoryCreateRequest`](#s-vendor-vendorinventorycreaterequest) |
| `DELETE` | `/api/v1/vendor/inventory/products/{productId}` | `productId` string(uuid) *(path)* | — |
| `GET` | `/api/v1/vendor/inventory/stats` | — | — |
| `GET` | `/api/v1/vendor/messages` | `page?` integer *(query)*<br>`pageSize?` integer *(query)*<br>`unreadOnly?` boolean *(query)* | — |
| `POST` | `/api/v1/vendor/messages` | — | [`Vendor.VendorMessageCreateRequest`](#s-vendor-vendormessagecreaterequest) |
| `GET` | `/api/v1/vendor/notifications` | `page?` integer *(query)*<br>`pageSize?` integer *(query)*<br>`unreadOnly?` boolean *(query)* | — |
| `PATCH` | `/api/v1/vendor/notifications/{notificationId}/read` | `notificationId` string *(path)* | — |
| `PUT` | `/api/v1/vendor/notifications/mark-all-read` | — | — |
| `GET` | `/api/v1/vendor/orders` | `page?` integer *(query)*<br>`pageSize?` integer *(query)*<br>`status?` OrderStatus *(query)*<br>`search?` string *(query)*<br>`fromDate?` string(date-time) *(query)*<br>`toDate?` string(date-time) *(query)*<br>`assignedOnly?` boolean *(query)*<br>`type?` string *(query)* | — |
| `GET` | `/api/v1/vendor/orders/{orderId}` | `orderId` string(uuid) *(path)* | — |
| `PATCH` | `/api/v1/vendor/orders/{orderId}/assignment` | `orderId` string(uuid) *(path)* | [`Vendor.VendorOrderAssignmentRequest`](#s-vendor-vendororderassignmentrequest) |
| `POST` | `/api/v1/vendor/orders/{orderId}/notes` | `orderId` string(uuid) *(path)* | [`Vendor.VendorOrderNoteRequest`](#s-vendor-vendorordernoterequest) |
| `PATCH` | `/api/v1/vendor/orders/{orderId}/status` | `orderId` string(uuid) *(path)* | [`Vendor.VendorOrderStatusUpdateRequest`](#s-vendor-vendororderstatusupdaterequest) |
| `GET` | `/api/v1/vendor/orders/export` | `status?` OrderStatus *(query)*<br>`search?` string *(query)*<br>`fromDate?` string(date-time) *(query)*<br>`toDate?` string(date-time) *(query)*<br>`assignedOnly?` boolean *(query)*<br>`type?` string *(query)* | — |
| `POST` | `/api/v1/vendor/orders/import` | — | **multipart/form-data**<br>`file` |

### <a id="tag-vendorportfolio"></a>VendorPortfolio

| Method | Path | Parameters | Body |
| --- | --- | --- | --- |
| `GET` | `/api/v1/vendor/portfolio` | — | — |
| `POST` | `/api/v1/vendor/portfolio` | — | [`Portfolio.CreatePortfolioProjectDto`](#s-portfolio-createportfolioprojectdto) |
| `DELETE` | `/api/v1/vendor/portfolio/{id}` | `id` string(uuid) *(path)* | — |
| `GET` | `/api/v1/vendor/portfolio/{id}` | `id` string(uuid) *(path)* | — |
| `PUT` | `/api/v1/vendor/portfolio/{id}` | `id` string(uuid) *(path)* | [`Portfolio.UpdatePortfolioProjectDto`](#s-portfolio-updateportfolioprojectdto) |
| `POST` | `/api/v1/vendor/portfolio/{id}/images` | `id` string(uuid) *(path)*<br>`imageType?` PortfolioImageType *(query)*<br>`caption?` string *(query)* | **multipart/form-data**<br>`file` |
| `DELETE` | `/api/v1/vendor/portfolio/{id}/images/{imageId}` | `id` string(uuid) *(path)*<br>`imageId` string(uuid) *(path)* | — |
| `POST` | `/api/v1/vendor/portfolio/{id}/publish` | `id` string(uuid) *(path)* | — |
| `POST` | `/api/v1/vendor/portfolio/{id}/unpublish` | `id` string(uuid) *(path)* | — |

## Schemas

Request payloads. `?` marks `nullable: true` — which, given only 7 schemas in the
whole spec declares `required`, means "the spec doesn't say" more often than it
means "genuinely optional".

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Consultations.ConsultationDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Consultations.ConsultationDto`](#s-consultations-consultationdto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Consultations.ConsultationPricingConfigDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Consultations.ConsultationPricingConfigDto`](#s-consultations-consultationpricingconfigdto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Consultations.ConsultationTypeDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Consultations.ConsultationTypeDto`](#s-consultations-consultationtypedto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Inspections.InspectionAvailabilityBlockDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Inspections.InspectionAvailabilityBlockDto`](#s-inspections-inspectionavailabilityblockdto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Inspections.InspectionCategoryDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Inspections.InspectionCategoryDto`](#s-inspections-inspectioncategorydto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Inspections.InspectionDetailDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Inspections.InspectionDetailDto`](#s-inspections-inspectiondetaildto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Inspections.InspectionFeeDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Inspections.InspectionFeeDto`](#s-inspections-inspectionfeedto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Products.ProductDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Products.ProductDto`](#s-products-productdto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Collections.Generic.List`1[[TBM.Application.DTOs.Subscriptions.ConsultationFeeDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]], System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | [`Subscriptions.ConsultationFeeDto`](#s-subscriptions-consultationfeedto)[] | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=7cec85d7bea7798e]]"></a>0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[System.Object, System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data?` | object | nullable |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Consultations.ConsultationAvailabilityDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Consultations.ConsultationAvailabilityDto`](#s-consultations-consultationavailabilitydto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Consultations.ConsultationBookingResultDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Consultations.ConsultationBookingResultDto`](#s-consultations-consultationbookingresultdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Consultations.ConsultationDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Consultations.ConsultationDto`](#s-consultations-consultationdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Consultations.ConsultationPagedResultDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Consultations.ConsultationPagedResultDto`](#s-consultations-consultationpagedresultdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Consultations.ConsultationPaymentInitializationDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Consultations.ConsultationPaymentInitializationDto`](#s-consultations-consultationpaymentinitializationdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Consultations.ConsultationPaymentVerificationDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Consultations.ConsultationPaymentVerificationDto`](#s-consultations-consultationpaymentverificationdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Consultations.ConsultationPricingConfigDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Consultations.ConsultationPricingConfigDto`](#s-consultations-consultationpricingconfigdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.DesignFlow.AddDesignSessionToCartResponseDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`DesignFlow.AddDesignSessionToCartResponseDto`](#s-designflow-adddesignsessiontocartresponsedto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.DesignFlow.CreateDesignSessionResponseDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`DesignFlow.CreateDesignSessionResponseDto`](#s-designflow-createdesignsessionresponsedto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.DesignFlow.DesignSessionDetailDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`DesignFlow.DesignSessionDetailDto`](#s-designflow-designsessiondetaildto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.DesignFlow.DesignSessionListDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`DesignFlow.DesignSessionListDto`](#s-designflow-designsessionlistdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.DesignFlow.DesignSessionStatusDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`DesignFlow.DesignSessionStatusDto`](#s-designflow-designsessionstatusdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.DesignFlow.GenerateDesignSessionResponseDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`DesignFlow.GenerateDesignSessionResponseDto`](#s-designflow-generatedesignsessionresponsedto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.DesignFlow.ProjectQuotationDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`DesignFlow.ProjectQuotationDto`](#s-designflow-projectquotationdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.DesignFlow.UploadDesignSessionPhotoResponseDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`DesignFlow.UploadDesignSessionPhotoResponseDto`](#s-designflow-uploaddesignsessionphotoresponsedto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Inspections.BookInspectionResponseDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Inspections.BookInspectionResponseDto`](#s-inspections-bookinspectionresponsedto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Inspections.InitializeInspectionPaymentResponseDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Inspections.InitializeInspectionPaymentResponseDto`](#s-inspections-initializeinspectionpaymentresponsedto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Inspections.InspectionAvailabilityBlockDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Inspections.InspectionAvailabilityBlockDto`](#s-inspections-inspectionavailabilityblockdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Inspections.InspectionAvailabilityDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Inspections.InspectionAvailabilityDto`](#s-inspections-inspectionavailabilitydto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Inspections.InspectionDetailDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Inspections.InspectionDetailDto`](#s-inspections-inspectiondetaildto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Inspections.VerifyInspectionPaymentResponseDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Inspections.VerifyInspectionPaymentResponseDto`](#s-inspections-verifyinspectionpaymentresponsedto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Products.AdminProductDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Products.AdminProductDto`](#s-products-adminproductdto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-0-0, culture=neutral, publickeytoken=null]]"></a>0.0, Culture=neutral, PublicKeyToken=null]]

<sub>`TBM.Application.DTOs.Common.ApiResponse`1[[TBM.Application.DTOs.Subscriptions.ConsultationFeeDto, TBM.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `message?` | string | nullable |
| `data` | [`Subscriptions.ConsultationFeeDto`](#s-subscriptions-consultationfeedto) |  |
| `errors?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-addressrequest"></a>AccountController.AddressRequest

<sub>`TBM.API.Controllers.V1.AccountController.AddressRequest`</sub>

Body of: `POST /api/v1/account/addresses`, `PUT /api/v1/account/addresses/{addressId}`

| Property | Type | |
| --- | --- | --- |
| `fullName?` | string | nullable |
| `street?` | string | nullable |
| `city?` | string | nullable |
| `state?` | string | nullable |
| `postalCode?` | string | nullable |
| `country?` | string | nullable |
| `phone?` | string | nullable |
| `deliveryNotes?` | string | nullable |
| `isDefault` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-changepasswordrequest"></a>AccountController.ChangePasswordRequest

<sub>`TBM.API.Controllers.V1.AccountController.ChangePasswordRequest`</sub>

Body of: `POST /api/v1/account/password/change`

| Property | Type | |
| --- | --- | --- |
| `currentPassword?` | string | nullable |
| `newPassword?` | string | nullable |
| `confirmNewPassword?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-notificationpreferencestate"></a>AccountController.NotificationPreferenceState

<sub>`TBM.API.Controllers.V1.AccountController.NotificationPreferenceState`</sub>

Body of: `PUT /api/v1/account/notifications`

| Property | Type | |
| --- | --- | --- |
| `emailOrderUpdates` | boolean |  |
| `emailPromotions` | boolean |  |
| `pushOrderUpdates` | boolean |  |
| `pushMarketing` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-optionalpasswordrequest"></a>AccountController.OptionalPasswordRequest

<sub>`TBM.API.Controllers.V1.AccountController.OptionalPasswordRequest`</sub>

Body of: `POST /api/v1/account/deactivate`, `DELETE /api/v1/account`

| Property | Type | |
| --- | --- | --- |
| `password?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-passwordotprequest"></a>AccountController.PasswordOtpRequest

<sub>`TBM.API.Controllers.V1.AccountController.PasswordOtpRequest`</sub>

Body of: `POST /api/v1/account/password/otp/request`

| Property | Type | |
| --- | --- | --- |
| `currentPassword?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-updateemailrequest"></a>AccountController.UpdateEmailRequest

<sub>`TBM.API.Controllers.V1.AccountController.UpdateEmailRequest`</sub>

Body of: `PUT /api/v1/account/email`

| Property | Type | |
| --- | --- | --- |
| `email?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-updatemerequest"></a>AccountController.UpdateMeRequest

<sub>`TBM.API.Controllers.V1.AccountController.UpdateMeRequest`</sub>

Body of: `PATCH /api/v1/account/me`

| Property | Type | |
| --- | --- | --- |
| `firstName?` | string | nullable |
| `lastName?` | string | nullable |
| `phoneNumber?` | string | nullable |
| `email?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-updatepasswordrequest"></a>AccountController.UpdatePasswordRequest

<sub>`TBM.API.Controllers.V1.AccountController.UpdatePasswordRequest`</sub>

Body of: `PUT /api/v1/account/password`

| Property | Type | |
| --- | --- | --- |
| `currentPassword?` | string | nullable |
| `newPassword?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-updatephonerequest"></a>AccountController.UpdatePhoneRequest

<sub>`TBM.API.Controllers.V1.AccountController.UpdatePhoneRequest`</sub>

Body of: `PUT /api/v1/account/phone`

| Property | Type | |
| --- | --- | --- |
| `phone?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-updateprofilerequest"></a>AccountController.UpdateProfileRequest

<sub>`TBM.API.Controllers.V1.AccountController.UpdateProfileRequest`</sub>

Body of: `PUT /api/v1/account/profile`

| Property | Type | |
| --- | --- | --- |
| `firstName?` | string | nullable |
| `lastName?` | string | nullable |
| `phoneNumber?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-updatetwofactorrequest"></a>AccountController.UpdateTwoFactorRequest

<sub>`TBM.API.Controllers.V1.AccountController.UpdateTwoFactorRequest`</sub>

Body of: `PUT /api/v1/account/security/2fa`

| Property | Type | |
| --- | --- | --- |
| `enabled` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-accountcontroller-verifypasswordotprequest"></a>AccountController.VerifyPasswordOtpRequest

<sub>`TBM.API.Controllers.V1.AccountController.VerifyPasswordOtpRequest`</sub>

Body of: `POST /api/v1/account/password/otp/verify`

| Property | Type | |
| --- | --- | --- |
| `otpCode?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-admin-admincreateuserrequestdto"></a>Admin.AdminCreateUserRequestDto

<sub>`TBM.Application.DTOs.Admin.AdminCreateUserRequestDto`</sub>

Body of: `POST /api/v1/admin/users`

| Property | Type | |
| --- | --- | --- |
| `fullName?` | string | nullable |
| `email?` | string | nullable |
| `role?` | string | nullable |
| `isActive` | boolean |  |
| `password?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-admin-adminupdateuserrolerequestdto"></a>Admin.AdminUpdateUserRoleRequestDto

<sub>`TBM.Application.DTOs.Admin.AdminUpdateUserRoleRequestDto`</sub>

Body of: `PATCH /api/v1/admin/users/{id}/role`

| Property | Type | |
| --- | --- | --- |
| `newRole?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-admin-adminupdateuserstatusrequestdto"></a>Admin.AdminUpdateUserStatusRequestDto

<sub>`TBM.Application.DTOs.Admin.AdminUpdateUserStatusRequestDto`</sub>

Body of: `PATCH /api/v1/admin/users/{id}/status`

| Property | Type | |
| --- | --- | --- |
| `isActive` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-admin-trackingdto"></a>Admin.TrackingDto

<sub>`TBM.Application.DTOs.Admin.TrackingDto`</sub>

Body of: `PATCH /api/v1/admin/orders/{id}/tracking`

| Property | Type | |
| --- | --- | --- |
| `trackingNumber?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-aicreditadjustmentrequestdto"></a>AI.AICreditAdjustmentRequestDto

<sub>`TBM.Application.DTOs.AI.AICreditAdjustmentRequestDto`</sub>

Body of: `POST /api/v1/admin/ai/credits/adjust`

| Property | Type | |
| --- | --- | --- |
| `userId` | string(uuid) |  |
| `amount` | integer |  |
| `reason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-approveassistanttoolactionrequestdto"></a>AI.ApproveAssistantToolActionRequestDto

<sub>`TBM.Application.DTOs.AI.ApproveAssistantToolActionRequestDto`</sub>

Body of: `POST /api/v1/ai/assistant/tool-actions/{actionId}/approval`

| Property | Type | |
| --- | --- | --- |
| `approve` | boolean |  |
| `reason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-assistantmessagerequestdto"></a>AI.AssistantMessageRequestDto

<sub>`TBM.Application.DTOs.AI.AssistantMessageRequestDto`</sub>

Body of: `POST /api/v1/ai/assistant/message`

| Property | Type | |
| --- | --- | --- |
| `sessionId?` | string(uuid) | nullable |
| `message?` | string | nullable |
| `enableToolPlanning` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-createaiprojectdto"></a>AI.CreateAIProjectDto

<sub>`TBM.Application.DTOs.AI.CreateAIProjectDto`</sub>

Body of: `POST /api/v1/ai/projects`

| Property | Type | |
| --- | --- | --- |
| `sourceImageUrl?` | string | nullable |
| `outputType` | [`AIOutputType`](#s-aioutputtype) |  |
| `generationType` | [`AIGenerationType`](#s-aigenerationtype) |  |
| `prompt?` | string | nullable |
| `contextLabel?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-createrenovationestimaterequestdto"></a>AI.CreateRenovationEstimateRequestDto

<sub>`TBM.Application.DTOs.AI.CreateRenovationEstimateRequestDto`</sub>

Body of: `POST /api/v1/ai/renovation/estimate`, `POST /api/v1/ai/renovation-estimates`

| Property | Type | |
| --- | --- | --- |
| `projectId?` | string(uuid) | nullable |
| `projectName?` | string | nullable |
| `roomType?` | string | nullable |
| `lengthMeters` | number |  |
| `widthMeters` | number |  |
| `heightMeters` | number |  |
| `finishLevel?` | string | nullable |
| `includeFlooring` | boolean |  |
| `includePainting` | boolean |  |
| `includeElectrical` | boolean |  |
| `includePlumbing` | boolean |  |
| `contingencyPercent` | number |  |
| `roomDimensions` | [`AI.RoomDimensionsDto`](#s-ai-roomdimensionsdto) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-executeassistanttoolactionrequestdto"></a>AI.ExecuteAssistantToolActionRequestDto

<sub>`TBM.Application.DTOs.AI.ExecuteAssistantToolActionRequestDto`</sub>

Body of: `POST /api/v1/ai/assistant/tool-actions/{actionId}/execute`

| Property | Type | |
| --- | --- | --- |
| `dryRun` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-generateimagedto"></a>AI.GenerateImageDto

<sub>`TBM.Application.DTOs.AI.GenerateImageDto`</sub>

Body of: `POST /api/v1/ai/generate/image`, `POST /api/v1/ai/transform/image`

| Property | Type | |
| --- | --- | --- |
| `projectId` | string(uuid) |  |
| `prompt?` | string | nullable |
| `sourceImageUrl?` | string | nullable |
| `contextTags?` | string[] | nullable |
| `style?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-generatevideodto"></a>AI.GenerateVideoDto

<sub>`TBM.Application.DTOs.AI.GenerateVideoDto`</sub>

Body of: `POST /api/v1/ai/generate/video`

| Property | Type | |
| --- | --- | --- |
| `projectId` | string(uuid) |  |
| `prompt?` | string | nullable |
| `sourceImageUrl?` | string | nullable |
| `durationSeconds` | integer |  |
| `contextTags?` | string[] | nullable |
| `style?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-roomdimensionsdto"></a>AI.RoomDimensionsDto

<sub>`TBM.Application.DTOs.AI.RoomDimensionsDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `length` | number |  |
| `width` | number |  |
| `height` | number |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-updateassistanttaskstatusrequestdto"></a>AI.UpdateAssistantTaskStatusRequestDto

<sub>`TBM.Application.DTOs.AI.UpdateAssistantTaskStatusRequestDto`</sub>

Body of: `PATCH /api/v1/ai/assistant/tasks/{taskId}`

| Property | Type | |
| --- | --- | --- |
| `status?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-ai-updatedesignvisibilitydto"></a>AI.UpdateDesignVisibilityDto

<sub>`TBM.Application.DTOs.AI.UpdateDesignVisibilityDto`</sub>

Body of: `PATCH /api/v1/Designs/{id}/visibility`

| Property | Type | |
| --- | --- | --- |
| `isPublic` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-auth-adminlogindto"></a>Auth.AdminLoginDto

<sub>`TBM.Application.DTOs.Auth.AdminLoginDto`</sub>

Body of: `POST /api/v1/admin/auth/login`

| Property | Type | |
| --- | --- | --- |
| `email?` | string | nullable |
| `password?` | string | nullable |
| `rememberMe` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-auth-forgotpassworddto"></a>Auth.ForgotPasswordDto

<sub>`TBM.Application.DTOs.Auth.ForgotPasswordDto`</sub>

Body of: `POST /api/v1/Auth/forgot-password`, `POST /api/v1/Auth/resend-verification`

| Property | Type | |
| --- | --- | --- |
| `email?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-auth-logindto"></a>Auth.LoginDto

<sub>`TBM.Application.DTOs.Auth.LoginDto`</sub>

Body of: `POST /api/v1/Auth/login`

| Property | Type | |
| --- | --- | --- |
| `email?` | string | nullable |
| `password?` | string | nullable |
| `guestCartItems?` | [`Orders.MergeCartItemDto`](#s-orders-mergecartitemdto)[] | nullable |
| `items?` | [`Orders.MergeCartItemDto`](#s-orders-mergecartitemdto)[] | nullable |
| `cartItems?` | [`Orders.MergeCartItemDto`](#s-orders-mergecartitemdto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-auth-refreshtokendto"></a>Auth.RefreshTokenDto

<sub>`TBM.Application.DTOs.Auth.RefreshTokenDto`</sub>

Body of: `POST /api/v1/admin/auth/refresh`, `POST /api/v1/admin/auth/logout`, `POST /api/v1/Auth/refresh-token`

| Property | Type | |
| --- | --- | --- |
| `refreshToken?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-auth-registerdto"></a>Auth.RegisterDto

<sub>`TBM.Application.DTOs.Auth.RegisterDto`</sub>

Body of: `POST /api/v1/Auth/register`

| Property | Type | |
| --- | --- | --- |
| `email?` | string | nullable |
| `password?` | string | nullable |
| `confirmPassword?` | string | nullable |
| `firstName?` | string | nullable |
| `lastName?` | string | nullable |
| `phoneNumber?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-auth-resetpassworddto"></a>Auth.ResetPasswordDto

<sub>`TBM.Application.DTOs.Auth.ResetPasswordDto`</sub>

Body of: `POST /api/v1/Auth/reset-password`

| Property | Type | |
| --- | --- | --- |
| `token?` | string | nullable |
| `newPassword?` | string | nullable |
| `confirmPassword?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-checkout-checkoutdeliverydto"></a>Checkout.CheckoutDeliveryDto

<sub>`TBM.Application.DTOs.Checkout.CheckoutDeliveryDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `fullName?` | string | nullable |
| `phone?` | string | nullable |
| `address?` | string | nullable |
| `city?` | string | nullable |
| `state?` | string | nullable |
| `notes?` | string | nullable |
| `customerNotes?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-checkout-checkoutpaymentdetailsdto"></a>Checkout.CheckoutPaymentDetailsDto

<sub>`TBM.Application.DTOs.Checkout.CheckoutPaymentDetailsDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `method?` | string | nullable |
| `reference?` | string | nullable |
| `callbackUrl?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-checkout-checkoutpaymentrequestdto"></a>Checkout.CheckoutPaymentRequestDto

<sub>`TBM.Application.DTOs.Checkout.CheckoutPaymentRequestDto`</sub>

Body of: `POST /api/v1/Checkout/payment`

| Property | Type | |
| --- | --- | --- |
| `designSessionId?` | string(uuid) | nullable |
| `guestEmail?` | string | nullable |
| `guestPhone?` | string | nullable |
| `guestSessionId?` | string | nullable |
| `delivery` | [`Checkout.CheckoutDeliveryDto`](#s-checkout-checkoutdeliverydto) |  |
| `payment` | [`Checkout.CheckoutPaymentDetailsDto`](#s-checkout-checkoutpaymentdetailsdto) |  |
| `total` | number |  |
| `promoCode?` | string | nullable |
| `idempotencyKey?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-checkout-promovalidationrequestdto"></a>Checkout.PromoValidationRequestDto

<sub>`TBM.Application.DTOs.Checkout.PromoValidationRequestDto`</sub>

Body of: `POST /api/v1/Cart/apply-promo`, `POST /api/v1/Checkout/validate-promo`

| Property | Type | |
| --- | --- | --- |
| `code?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-bookconsultationrequestdto"></a>Consultations.BookConsultationRequestDto

<sub>`TBM.Application.DTOs.Consultations.BookConsultationRequestDto`</sub>

Body of: `POST /api/v1/consultations/book`, `POST /api/v1/consultations`

| Property | Type | |
| --- | --- | --- |
| `typeKey?` | string | nullable |
| `scheduledStart` | string(date-time) |  |
| `projectId?` | string(uuid) | nullable |
| `contactName?` | string | nullable |
| `contactPhone?` | string | nullable |
| `contactEmail?` | string | nullable |
| `propertyType?` | string | nullable |
| `siteAddress?` | string | nullable |
| `siteCity?` | string | nullable |
| `siteState?` | string | nullable |
| `notes?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-cancelconsultationrequestdto"></a>Consultations.CancelConsultationRequestDto

<sub>`TBM.Application.DTOs.Consultations.CancelConsultationRequestDto`</sub>

Body of: `PUT /api/v1/admin/consultations/{id}/cancel`, `POST /api/v1/consultations/{id}/cancel`, `PUT /api/v1/consultations/{id}/cancel`

| Property | Type | |
| --- | --- | --- |
| `reason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationavailabilitydto"></a>Consultations.ConsultationAvailabilityDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationAvailabilityDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `type` | [`Consultations.ConsultationTypeDto`](#s-consultations-consultationtypedto) |  |
| `timeZone?` | string | nullable |
| `slots?` | [`Consultations.ConsultationSlotDto`](#s-consultations-consultationslotdto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationbookingresultdto"></a>Consultations.ConsultationBookingResultDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationBookingResultDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `consultation` | [`Consultations.ConsultationDto`](#s-consultations-consultationdto) |  |
| `managementToken?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationdto"></a>Consultations.ConsultationDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `projectId?` | string(uuid) | nullable |
| `typeKey?` | string | nullable |
| `typeName?` | string | nullable |
| `format?` | string | nullable |
| `durationMinutes` | integer |  |
| `fee` | number |  |
| `scheduledStart` | string(date-time) |  |
| `scheduledEnd` | string(date-time) |  |
| `status?` | string | nullable |
| `paymentVerified` | boolean |  |
| `paymentReference?` | string | nullable |
| `contactName?` | string | nullable |
| `contactEmail?` | string | nullable |
| `contactPhone?` | string | nullable |
| `propertyType?` | string | nullable |
| `siteAddress?` | string | nullable |
| `siteCity?` | string | nullable |
| `siteState?` | string | nullable |
| `notes?` | string | nullable |
| `cancelledAtUtc?` | string(date-time) | nullable |
| `cancellationReason?` | string | nullable |
| `cancellationRequiresManualRefundReview` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationpagedresultdto"></a>Consultations.ConsultationPagedResultDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationPagedResultDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `items?` | [`Consultations.ConsultationDto`](#s-consultations-consultationdto)[] | nullable |
| `page` | integer |  |
| `pageSize` | integer |  |
| `totalCount` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationpaymentinitializationdto"></a>Consultations.ConsultationPaymentInitializationDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationPaymentInitializationDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `authorizationUrl?` | string | nullable |
| `accessCode?` | string | nullable |
| `reference?` | string | nullable |
| `amount` | number |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationpaymentverificationdto"></a>Consultations.ConsultationPaymentVerificationDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationPaymentVerificationDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `verified` | boolean |  |
| `reference?` | string | nullable |
| `amount` | number |  |
| `paidAtUtc?` | string(date-time) | nullable |
| `status?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationpricingconfigdto"></a>Consultations.ConsultationPricingConfigDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationPricingConfigDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `consultationType?` | string | nullable |
| `fee` | number |  |
| `currency?` | string | nullable |
| `location?` | string | nullable |
| `creditedTowardProject` | boolean |  |
| `isActive` | boolean |  |
| `updatedAt?` | string(date-time) | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationslotdto"></a>Consultations.ConsultationSlotDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationSlotDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `start` | string(date-time) |  |
| `end` | string(date-time) |  |
| `isAvailable` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-consultationtypedto"></a>Consultations.ConsultationTypeDto

<sub>`TBM.Application.DTOs.Consultations.ConsultationTypeDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `key?` | string | nullable |
| `name?` | string | nullable |
| `durationMinutes` | integer |  |
| `fee` | number |  |
| `currency?` | string | nullable |
| `format?` | string | nullable |
| `description?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-initializeconsultationpaymentrequestdto"></a>Consultations.InitializeConsultationPaymentRequestDto

<sub>`TBM.Application.DTOs.Consultations.InitializeConsultationPaymentRequestDto`</sub>

Body of: `POST /api/v1/consultations/{id}/initialize-payment`

| Property | Type | |
| --- | --- | --- |
| `email?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-rescheduleconsultationrequestdto"></a>Consultations.RescheduleConsultationRequestDto

<sub>`TBM.Application.DTOs.Consultations.RescheduleConsultationRequestDto`</sub>

Body of: `PUT /api/v1/consultations/{id}/reschedule`

| Property | Type | |
| --- | --- | --- |
| `scheduledStart` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-updateconsultationpricingconfigrequestdto"></a>Consultations.UpdateConsultationPricingConfigRequestDto

<sub>`TBM.Application.DTOs.Consultations.UpdateConsultationPricingConfigRequestDto`</sub>

Body of: `PUT /api/v1/admin/consultations/pricing/{id}`

| Property | Type | |
| --- | --- | --- |
| `fee` | number |  |
| `currency?` | string | nullable |
| `location?` | string | nullable |
| `creditedTowardProject` | boolean |  |
| `isActive` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-consultations-verifyconsultationpaymentrequestdto"></a>Consultations.VerifyConsultationPaymentRequestDto

<sub>`TBM.Application.DTOs.Consultations.VerifyConsultationPaymentRequestDto`</sub>

Body of: `POST /api/v1/consultations/verify-payment`

| Property | Type | |
| --- | --- | --- |
| `reference?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-contact-createcontactmessagedto"></a>Contact.CreateContactMessageDto

<sub>`TBM.Application.DTOs.Contact.CreateContactMessageDto`</sub>

Body of: `POST /api/v1/contact`

| Property | Type | |
| --- | --- | --- |
| `fullName` | string |  |
| `email` | string(email) |  |
| `phoneNumber?` | string | nullable |
| `subject?` | string | nullable |
| `message` | string |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-adddesignsessiontocartrequestdto"></a>DesignFlow.AddDesignSessionToCartRequestDto

<sub>`TBM.Application.DTOs.DesignFlow.AddDesignSessionToCartRequestDto`</sub>

Body of: `POST /api/v1/designs/sessions/{sessionId}/add-to-cart`

| Property | Type | |
| --- | --- | --- |
| `addAll` | boolean |  |
| `itemIds?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-adddesignsessiontocartresponsedto"></a>DesignFlow.AddDesignSessionToCartResponseDto

<sub>`TBM.Application.DTOs.DesignFlow.AddDesignSessionToCartResponseDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `cartId` | string(uuid) |  |
| `itemsAdded` | integer |  |
| `totalAmount` | number |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-billofmaterialsdto"></a>DesignFlow.BillOfMaterialsDto

<sub>`TBM.Application.DTOs.DesignFlow.BillOfMaterialsDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `designSessionId` | string(uuid) |  |
| `bomNumber?` | string | nullable |
| `totalEstimatedCost` | number |  |
| `itemCount` | integer |  |
| `status?` | string | nullable |
| `items?` | [`DesignFlow.BomItemDto`](#s-designflow-bomitemdto)[] | nullable |
| `createdAt` | string(date-time) |  |
| `updatedAt` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-bomitemdto"></a>DesignFlow.BomItemDto

<sub>`TBM.Application.DTOs.DesignFlow.BomItemDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `productId` | string(uuid) |  |
| `sku?` | string | nullable |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `quantity` | number |  |
| `unitPrice` | number |  |
| `totalPrice` | number |  |
| `inStock` | boolean |  |
| `vendorId?` | string(uuid) | nullable |
| `leadTimeDays?` | integer | nullable |
| `reason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-createdesignsessionrequestdto"></a>DesignFlow.CreateDesignSessionRequestDto

<sub>`TBM.Application.DTOs.DesignFlow.CreateDesignSessionRequestDto`</sub>

Body of: `POST /api/v1/designs/sessions`

| Property | Type | |
| --- | --- | --- |
| `projectId?` | string(uuid) | nullable |
| `projectName?` | string | nullable |
| `roomType?` | string | nullable |
| `visionText?` | string | nullable |
| `tier` | [`DesignSessionTier`](#s-designsessiontier) |  |
| `roomDimensions` | [`DesignFlow.RoomDimensionsDto`](#s-designflow-roomdimensionsdto) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-createdesignsessionresponsedto"></a>DesignFlow.CreateDesignSessionResponseDto

<sub>`TBM.Application.DTOs.DesignFlow.CreateDesignSessionResponseDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `sessionId` | string(uuid) |  |
| `sessionNumber?` | string | nullable |
| `status?` | string | nullable |
| `uploadUrl?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-createprojectquotationrequestdto"></a>DesignFlow.CreateProjectQuotationRequestDto

<sub>`TBM.Application.DTOs.DesignFlow.CreateProjectQuotationRequestDto`</sub>

Body of: `POST /api/v1/admin/projects/{projectId}/quotations`

| Property | Type | |
| --- | --- | --- |
| `title?` | string | nullable |
| `description?` | string | nullable |
| `subtotal` | number |  |
| `discount` | number |  |
| `currency?` | string | nullable |
| `validUntilUtc?` | string(date-time) | nullable |
| `notes?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-createprojectrequestdto"></a>DesignFlow.CreateProjectRequestDto

<sub>`TBM.Application.DTOs.DesignFlow.CreateProjectRequestDto`</sub>

Body of: `POST /api/v1/projects`

| Property | Type | |
| --- | --- | --- |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `roomType?` | string | nullable |
| `startDate?` | string(date-time) | nullable |
| `totalBudget?` | number | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-designsessiondetaildto"></a>DesignFlow.DesignSessionDetailDto

<sub>`TBM.Application.DTOs.DesignFlow.DesignSessionDetailDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `session` | [`DesignFlow.DesignSessionDto`](#s-designflow-designsessiondto) |  |
| `billOfMaterials` | [`DesignFlow.BillOfMaterialsDto`](#s-designflow-billofmaterialsdto) |  |
| `allItemsInStock` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-designsessiondto"></a>DesignFlow.DesignSessionDto

<sub>`TBM.Application.DTOs.DesignFlow.DesignSessionDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `sessionId` | string(uuid) |  |
| `sessionNumber?` | string | nullable |
| `projectName?` | string | nullable |
| `roomType?` | string | nullable |
| `visionText?` | string | nullable |
| `tier` | [`DesignSessionTier`](#s-designsessiontier) |  |
| `status?` | string | nullable |
| `progress` | integer |  |
| `currentStep?` | string | nullable |
| `errorMessage?` | string | nullable |
| `originalImageUrl?` | string | nullable |
| `generatedImageUrl?` | string | nullable |
| `roomLength` | number |  |
| `roomWidth` | number |  |
| `roomHeight` | number |  |
| `bomId?` | string(uuid) | nullable |
| `orderId?` | string(uuid) | nullable |
| `projectId?` | string(uuid) | nullable |
| `createdAt` | string(date-time) |  |
| `updatedAt` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-designsessionlistdto"></a>DesignFlow.DesignSessionListDto

<sub>`TBM.Application.DTOs.DesignFlow.DesignSessionListDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `sessions?` | [`DesignFlow.DesignSessionSummaryDto`](#s-designflow-designsessionsummarydto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-designsessionstatusdto"></a>DesignFlow.DesignSessionStatusDto

<sub>`TBM.Application.DTOs.DesignFlow.DesignSessionStatusDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `status?` | string | nullable |
| `progress` | integer |  |
| `currentStep?` | string | nullable |
| `imageUrl?` | string | nullable |
| `bomGenerated` | boolean |  |
| `errorMessage?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-designsessionsummarydto"></a>DesignFlow.DesignSessionSummaryDto

<sub>`TBM.Application.DTOs.DesignFlow.DesignSessionSummaryDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `sessionId` | string(uuid) |  |
| `sessionNumber?` | string | nullable |
| `projectName?` | string | nullable |
| `roomType?` | string | nullable |
| `tier` | [`DesignSessionTier`](#s-designsessiontier) |  |
| `status?` | string | nullable |
| `progress` | integer |  |
| `imageUrl?` | string | nullable |
| `createdAt` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-generatedesignsessionrequestdto"></a>DesignFlow.GenerateDesignSessionRequestDto

<sub>`TBM.Application.DTOs.DesignFlow.GenerateDesignSessionRequestDto`</sub>

Body of: `POST /api/v1/designs/sessions/{sessionId}/generate`

| Property | Type | |
| --- | --- | --- |
| `generateBOM` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-generatedesignsessionresponsedto"></a>DesignFlow.GenerateDesignSessionResponseDto

<sub>`TBM.Application.DTOs.DesignFlow.GenerateDesignSessionResponseDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `status?` | string | nullable |
| `estimatedTime` | integer |  |
| `statusUrl?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-projectquotationdto"></a>DesignFlow.ProjectQuotationDto

<sub>`TBM.Application.DTOs.DesignFlow.ProjectQuotationDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `projectId` | string(uuid) |  |
| `quotationNumber?` | string | nullable |
| `title?` | string | nullable |
| `description?` | string | nullable |
| `subtotal` | number |  |
| `discount` | number |  |
| `total` | number |  |
| `currency?` | string | nullable |
| `status?` | string | nullable |
| `validUntilUtc?` | string(date-time) | nullable |
| `sentAtUtc?` | string(date-time) | nullable |
| `acceptedAtUtc?` | string(date-time) | nullable |
| `rejectedAtUtc?` | string(date-time) | nullable |
| `notes?` | string | nullable |
| `createdAt` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-roomdimensionsdto"></a>DesignFlow.RoomDimensionsDto

<sub>`TBM.Application.DTOs.DesignFlow.RoomDimensionsDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `length` | number |  |
| `width` | number |  |
| `height` | number |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-updateprojectquotationstatusrequestdto"></a>DesignFlow.UpdateProjectQuotationStatusRequestDto

<sub>`TBM.Application.DTOs.DesignFlow.UpdateProjectQuotationStatusRequestDto`</sub>

Body of: `PUT /api/v1/admin/projects/{projectId}/quotations/{quotationId}/status`

| Property | Type | |
| --- | --- | --- |
| `status?` | string | nullable |
| `notes?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-designflow-uploaddesignsessionphotoresponsedto"></a>DesignFlow.UploadDesignSessionPhotoResponseDto

<sub>`TBM.Application.DTOs.DesignFlow.UploadDesignSessionPhotoResponseDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `originalImageUrl?` | string | nullable |
| `status?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-bookinspectionrequestdto"></a>Inspections.BookInspectionRequestDto

<sub>`TBM.Application.DTOs.Inspections.BookInspectionRequestDto`</sub>

Body of: `POST /api/v1/inspections/book`

| Property | Type | |
| --- | --- | --- |
| `projectId?` | string(uuid) | nullable |
| `consultationType` | [`ConsultationType`](#s-consultationtype) |  |
| `propertyType` | string |  |
| `contactName` | string |  |
| `contactPhone` | string |  |
| `contactEmail` | string(email) |  |
| `siteAddress` | string |  |
| `siteCity` | string |  |
| `siteState` | string |  |
| `preferredDate1` | string(date-time) |  |
| `preferredDate2?` | string(date-time) | nullable |
| `uploadedFileUrls?` | string[] | nullable |
| `paymentReference?` | string | nullable |
| `additionalNotes?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-bookinspectionresponsedto"></a>Inspections.BookInspectionResponseDto

<sub>`TBM.Application.DTOs.Inspections.BookInspectionResponseDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `bookingId` | string(uuid) |  |
| `projectId?` | string(uuid) | nullable |
| `status?` | string | nullable |
| `message?` | string | nullable |
| `consultationType` | [`ConsultationType`](#s-consultationtype) |  |
| `propertyType?` | string | nullable |
| `fee` | number |  |
| `paymentStatus?` | string | nullable |
| `scheduledStart` | string(date-time) |  |
| `managementToken?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-cancelinspectionrequestdto"></a>Inspections.CancelInspectionRequestDto

<sub>`TBM.Application.DTOs.Inspections.CancelInspectionRequestDto`</sub>

Body of: `POST /api/v1/inspections/{id}/cancel`

| Property | Type | |
| --- | --- | --- |
| `reason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-createinspectionavailabilityblockrequestdto"></a>Inspections.CreateInspectionAvailabilityBlockRequestDto

<sub>`TBM.Application.DTOs.Inspections.CreateInspectionAvailabilityBlockRequestDto`</sub>

Body of: `POST /api/v1/admin/inspections/availability/blocks`

| Property | Type | |
| --- | --- | --- |
| `start` | string(date-time) |  |
| `end` | string(date-time) |  |
| `state?` | string | nullable |
| `staffId?` | string | nullable |
| `reason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-createinspectionpricingconfigrequestdto"></a>Inspections.CreateInspectionPricingConfigRequestDto

<sub>`TBM.Application.DTOs.Inspections.CreateInspectionPricingConfigRequestDto`</sub>

Body of: `POST /api/v1/admin/inspections/pricing`

| Property | Type | |
| --- | --- | --- |
| `consultationType` | string |  |
| `fee` | number |  |
| `currency` | string |  |
| `location?` | string | nullable |
| `creditedTowardProject` | boolean |  |
| `isActive` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-initializeinspectionpaymentrequestdto"></a>Inspections.InitializeInspectionPaymentRequestDto

<sub>`TBM.Application.DTOs.Inspections.InitializeInspectionPaymentRequestDto`</sub>

Body of: `POST /api/v1/inspections/{id}/initialize-payment`, `POST /api/v1/inspections/{id}/payment`

| Property | Type | |
| --- | --- | --- |
| `email?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-initializeinspectionpaymentresponsedto"></a>Inspections.InitializeInspectionPaymentResponseDto

<sub>`TBM.Application.DTOs.Inspections.InitializeInspectionPaymentResponseDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `authorizationUrl?` | string | nullable |
| `accessCode?` | string | nullable |
| `reference?` | string | nullable |
| `amount` | number |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-inspectionavailabilityblockdto"></a>Inspections.InspectionAvailabilityBlockDto

<sub>`TBM.Application.DTOs.Inspections.InspectionAvailabilityBlockDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `start` | string(date-time) |  |
| `end` | string(date-time) |  |
| `state?` | string | nullable |
| `staffId?` | string | nullable |
| `reason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-inspectionavailabilitydto"></a>Inspections.InspectionAvailabilityDto

<sub>`TBM.Application.DTOs.Inspections.InspectionAvailabilityDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `consultationType` | [`ConsultationType`](#s-consultationtype) |  |
| `date` | string(date) |  |
| `timeZone?` | string | nullable |
| `slots?` | [`Inspections.InspectionSlotDto`](#s-inspections-inspectionslotdto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-inspectioncategorydto"></a>Inspections.InspectionCategoryDto

<sub>`TBM.Application.DTOs.Inspections.InspectionCategoryDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `consultationType` | [`ConsultationType`](#s-consultationtype) |  |
| `pricingConfigType?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-inspectiondetaildto"></a>Inspections.InspectionDetailDto

<sub>`TBM.Application.DTOs.Inspections.InspectionDetailDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `projectId?` | string(uuid) | nullable |
| `consultationType` | [`ConsultationType`](#s-consultationtype) |  |
| `propertyType?` | string | nullable |
| `staffId?` | string | nullable |
| `contactName?` | string | nullable |
| `contactPhone?` | string | nullable |
| `contactEmail?` | string | nullable |
| `siteAddress?` | string | nullable |
| `siteCity?` | string | nullable |
| `siteState?` | string | nullable |
| `scheduledStart` | string(date-time) |  |
| `scheduledEnd` | string(date-time) |  |
| `fee` | number |  |
| `paymentVerified` | boolean |  |
| `paymentStatus?` | string | nullable |
| `paymentReference?` | string | nullable |
| `status?` | string | nullable |
| `cancelledAtUtc?` | string(date-time) | nullable |
| `cancellationReason?` | string | nullable |
| `cancellationRequiresManualRefundReview` | boolean |  |
| `additionalNotes?` | string | nullable |
| `uploadedFileUrls?` | string[] | nullable |
| `createdAt` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-inspectionfeedto"></a>Inspections.InspectionFeeDto

<sub>`TBM.Application.DTOs.Inspections.InspectionFeeDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `consultationType?` | string | nullable |
| `fee` | number |  |
| `currency?` | string | nullable |
| `location?` | string | nullable |
| `creditedTowardProject` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-inspectionslotdto"></a>Inspections.InspectionSlotDto

<sub>`TBM.Application.DTOs.Inspections.InspectionSlotDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `start` | string(date-time) |  |
| `end` | string(date-time) |  |
| `available` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-rescheduleinspectionrequestdto"></a>Inspections.RescheduleInspectionRequestDto

<sub>`TBM.Application.DTOs.Inspections.RescheduleInspectionRequestDto`</sub>

Body of: `PATCH /api/v1/inspections/{id}/reschedule`

| Property | Type | |
| --- | --- | --- |
| `scheduledStart` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-updateinspectionpricingconfigrequestdto"></a>Inspections.UpdateInspectionPricingConfigRequestDto

<sub>`TBM.Application.DTOs.Inspections.UpdateInspectionPricingConfigRequestDto`</sub>

Body of: `PUT /api/v1/admin/inspections/pricing/{id}`

| Property | Type | |
| --- | --- | --- |
| `fee` | number |  |
| `currency` | string |  |
| `location?` | string | nullable |
| `creditedTowardProject` | boolean |  |
| `isActive` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-updateinspectionstatusrequestdto"></a>Inspections.UpdateInspectionStatusRequestDto

<sub>`TBM.Application.DTOs.Inspections.UpdateInspectionStatusRequestDto`</sub>

Body of: `PATCH /api/v1/admin/inspections/{id}/status`

| Property | Type | |
| --- | --- | --- |
| `status` | string |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-verifyinspectionpaymentrequestdto"></a>Inspections.VerifyInspectionPaymentRequestDto

<sub>`TBM.Application.DTOs.Inspections.VerifyInspectionPaymentRequestDto`</sub>

Body of: `POST /api/v1/inspections/verify-payment`

| Property | Type | |
| --- | --- | --- |
| `reference?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-inspections-verifyinspectionpaymentresponsedto"></a>Inspections.VerifyInspectionPaymentResponseDto

<sub>`TBM.Application.DTOs.Inspections.VerifyInspectionPaymentResponseDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `success` | boolean |  |
| `verified` | boolean |  |
| `amount` | number |  |
| `reference?` | string | nullable |
| `paidAt?` | string(date-time) | nullable |
| `message?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-legacyadminsettingsformdto"></a>LegacyAdminSettingsFormDto

<sub>`LegacyAdminSettingsFormDto`</sub>

Body of: `PUT /api/v1/admin/settings`

| Property | Type | |
| --- | --- | --- |
| `baseFee` | number |  |
| `fixedFee` | number |  |
| `currency?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-orders-addtocartdto"></a>Orders.AddToCartDto

<sub>`TBM.Application.DTOs.Orders.AddToCartDto`</sub>

Body of: `POST /api/v1/Cart/items`

| Property | Type | |
| --- | --- | --- |
| `productId` | string(uuid) |  |
| `quantity` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-orders-cancelorderdto"></a>Orders.CancelOrderDto

<sub>`TBM.Application.DTOs.Orders.CancelOrderDto`</sub>

Body of: `POST /api/v1/orders/{orderId}/cancel`

| Property | Type | |
| --- | --- | --- |
| `reason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-orders-createorderdto"></a>Orders.CreateOrderDto

<sub>`TBM.Application.DTOs.Orders.CreateOrderDto`</sub>

Body of: `POST /api/v1/orders`

| Property | Type | |
| --- | --- | --- |
| `designSessionId?` | string(uuid) | nullable |
| `paymentReference?` | string | nullable |
| `guestEmail?` | string | nullable |
| `guestPhone?` | string | nullable |
| `guestSessionId?` | string | nullable |
| `shippingFullName?` | string | nullable |
| `shippingPhone?` | string | nullable |
| `shippingAddress?` | string | nullable |
| `shippingCity?` | string | nullable |
| `shippingState?` | string | nullable |
| `shippingNotes?` | string | nullable |
| `customerNotes?` | string | nullable |
| `promoCode?` | string | nullable |
| `shippingCost?` | number | nullable |
| `tax?` | number | nullable |
| `discount?` | number | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-orders-mergecartitemdto"></a>Orders.MergeCartItemDto

<sub>`TBM.Application.DTOs.Orders.MergeCartItemDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `productId` | string(uuid) |  |
| `quantity` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-orders-mergecartrequestdto"></a>Orders.MergeCartRequestDto

<sub>`TBM.Application.DTOs.Orders.MergeCartRequestDto`</sub>

Body of: `POST /api/v1/Cart/merge`

| Property | Type | |
| --- | --- | --- |
| `items?` | [`Orders.MergeCartItemDto`](#s-orders-mergecartitemdto)[] | nullable |
| `guestCartItems?` | [`Orders.MergeCartItemDto`](#s-orders-mergecartitemdto)[] | nullable |
| `cartItems?` | [`Orders.MergeCartItemDto`](#s-orders-mergecartitemdto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-orders-updatecartitemdto"></a>Orders.UpdateCartItemDto

<sub>`TBM.Application.DTOs.Orders.UpdateCartItemDto`</sub>

Body of: `PUT /api/v1/Cart/items/{itemId}`

| Property | Type | |
| --- | --- | --- |
| `quantity` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-portfolio-admincreateportfolioprojectdto"></a>Portfolio.AdminCreatePortfolioProjectDto

<sub>`TBM.Application.DTOs.Portfolio.AdminCreatePortfolioProjectDto`</sub>

Body of: `POST /api/v1/admin/AdminPortfolio`

| Property | Type | |
| --- | --- | --- |
| `vendorName?` | string | nullable |
| `title?` | string | nullable |
| `location?` | string | nullable |
| `category?` | string | nullable |
| `budgetMin?` | number | nullable |
| `budgetMax?` | number | nullable |
| `durationMinDays?` | integer | nullable |
| `durationMaxDays?` | integer | nullable |
| `description?` | string | nullable |
| `scopeOfWork?` | string[] | nullable |
| `publishImmediately` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-portfolio-createportfolioprojectdto"></a>Portfolio.CreatePortfolioProjectDto

<sub>`TBM.Application.DTOs.Portfolio.CreatePortfolioProjectDto`</sub>

Body of: `POST /api/v1/vendor/portfolio`

| Property | Type | |
| --- | --- | --- |
| `title?` | string | nullable |
| `location?` | string | nullable |
| `category?` | string | nullable |
| `budgetMin?` | number | nullable |
| `budgetMax?` | number | nullable |
| `durationMinDays?` | integer | nullable |
| `durationMaxDays?` | integer | nullable |
| `description?` | string | nullable |
| `scopeOfWork?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-portfolio-updateportfolioprojectdto"></a>Portfolio.UpdatePortfolioProjectDto

<sub>`TBM.Application.DTOs.Portfolio.UpdatePortfolioProjectDto`</sub>

Body of: `PUT /api/v1/admin/AdminPortfolio/{id}`, `PUT /api/v1/vendor/portfolio/{id}`

| Property | Type | |
| --- | --- | --- |
| `title?` | string | nullable |
| `location?` | string | nullable |
| `category?` | string | nullable |
| `budgetMin?` | number | nullable |
| `budgetMax?` | number | nullable |
| `durationMinDays?` | integer | nullable |
| `durationMaxDays?` | integer | nullable |
| `description?` | string | nullable |
| `scopeOfWork?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-portfolio-updateportfoliostatusdto"></a>Portfolio.UpdatePortfolioStatusDto

<sub>`TBM.Application.DTOs.Portfolio.UpdatePortfolioStatusDto`</sub>

Body of: `PATCH /api/v1/admin/AdminPortfolio/{id}/status`

| Property | Type | |
| --- | --- | --- |
| `status` | [`PortfolioStatus`](#s-portfoliostatus) |  |
| `rejectionReason?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-addproductimagedto"></a>Products.AddProductImageDto

<sub>`TBM.Application.DTOs.Products.AddProductImageDto`</sub>

Body of: `POST /api/v1/admin/AdminProducts/{id}/images`, `POST /api/v1/Products/{id}/images`

| Property | Type | |
| --- | --- | --- |
| `imageUrl?` | string | nullable |
| `altText?` | string | nullable |
| `viewType?` | string | nullable |
| `displayOrder` | integer |  |
| `isPrimary` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-adminproductdto"></a>Products.AdminProductDto

<sub>`TBM.Application.DTOs.Products.AdminProductDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `shortDescription?` | string | nullable |
| `slug?` | string | nullable |
| `sku?` | string | nullable |
| `brandType` | integer |  |
| `brandName?` | string | nullable |
| `productType` | integer |  |
| `productTypeName?` | string | nullable |
| `categoryId` | string(uuid) |  |
| `categoryName?` | string | nullable |
| `price?` | number | nullable |
| `compareAtPrice?` | number | nullable |
| `showPrice` | boolean |  |
| `priceDisplay?` | string | nullable |
| `stockQuantity?` | integer | nullable |
| `inStock` | boolean |  |
| `trackInventory` | boolean |  |
| `isActive` | boolean |  |
| `isFeatured` | boolean |  |
| `displayOrder` | integer |  |
| `lowStockThreshold` | integer |  |
| `averageRating` | number |  |
| `reviewCount` | integer |  |
| `metaTitle?` | string | nullable |
| `metaDescription?` | string | nullable |
| `metaKeywords?` | string | nullable |
| `tags?` | string | nullable |
| `aiKeywords?` | string | nullable |
| `materialType?` | string | nullable |
| `qualityTier?` | string | nullable |
| `recommendedFor?` | string | nullable |
| `specifications?` | [`Products.SpecificationItemDto`](#s-products-specificationitemdto)[] | nullable |
| `keyFeatures?` | string[] | nullable |
| `whatsIncluded?` | string[] | nullable |
| `whatsNotIncluded?` | string[] | nullable |
| `dimensions?` | string | nullable |
| `warranty?` | string | nullable |
| `finishType?` | string | nullable |
| `installationType?` | string | nullable |
| `material?` | string | nullable |
| `color?` | string | nullable |
| `size?` | string | nullable |
| `variants?` | [`Products.ProductVariantDto`](#s-products-productvariantdto)[] | nullable |
| `images?` | [`Products.ProductImageDto`](#s-products-productimagedto)[] | nullable |
| `primaryImageUrl?` | string | nullable |
| `similarProducts?` | [`Products.ProductCardDto`](#s-products-productcarddto)[] | nullable |
| `createdAt` | string(date-time) |  |
| `updatedAt` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-bulkupdateproductitemdto"></a>Products.BulkUpdateProductItemDto

<sub>`TBM.Application.DTOs.Products.BulkUpdateProductItemDto`</sub>

Body of: `PUT /api/v1/admin/AdminProducts/bulk`

| Property | Type | |
| --- | --- | --- |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `shortDescription?` | string | nullable |
| `sku?` | string | nullable |
| `categoryId` | string(uuid) |  |
| `price?` | number | nullable |
| `compareAtPrice?` | number | nullable |
| `showPrice` | boolean |  |
| `stockQuantity?` | integer | nullable |
| `lowStockThreshold?` | integer | nullable |
| `trackInventory` | boolean |  |
| `isActive` | boolean |  |
| `isFeatured` | boolean |  |
| `displayOrder` | integer |  |
| `metaTitle?` | string | nullable |
| `metaDescription?` | string | nullable |
| `metaKeywords?` | string | nullable |
| `tags?` | string | nullable |
| `aiKeywords?` | string | nullable |
| `materialType?` | string | nullable |
| `qualityTier?` | string | nullable |
| `recommendedFor?` | string | nullable |
| `specifications?` | [`Products.SpecificationItemDto`](#s-products-specificationitemdto)[] | nullable |
| `keyFeatures?` | string[] | nullable |
| `whatsIncluded?` | string[] | nullable |
| `whatsNotIncluded?` | string[] | nullable |
| `dimensions?` | string | nullable |
| `warranty?` | string | nullable |
| `finishType?` | string | nullable |
| `installationType?` | string | nullable |
| `material?` | string | nullable |
| `color?` | string | nullable |
| `size?` | string | nullable |
| `variants?` | [`Products.CreateProductVariantDto`](#s-products-createproductvariantdto)[] | nullable |
| `images?` | [`Products.AddProductImageDto`](#s-products-addproductimagedto)[] | nullable |
| `id` | string(uuid) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-cartrelatedproductdto"></a>Products.CartRelatedProductDto

<sub>`TBM.Application.DTOs.Products.CartRelatedProductDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `name?` | string | nullable |
| `price?` | number | nullable |
| `showPrice` | boolean |  |
| `priceDisplay?` | string | nullable |
| `image?` | string | nullable |
| `rating?` | number | nullable |
| `reviewCount` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-createcategorydto"></a>Products.CreateCategoryDto

<sub>`TBM.Application.DTOs.Products.CreateCategoryDto`</sub>

Body of: `POST /api/v1/Categories`

| Property | Type | |
| --- | --- | --- |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `brandType` | integer |  |
| `parentCategoryId?` | string(uuid) | nullable |
| `imageUrl?` | string | nullable |
| `iconUrl?` | string | nullable |
| `displayOrder` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-createproductdto"></a>Products.CreateProductDto

<sub>`TBM.Application.DTOs.Products.CreateProductDto`</sub>

Body of: `POST /api/v1/admin/AdminProducts/bulk`, `POST /api/v1/admin/AdminProducts`, `POST /api/v1/Products`

| Property | Type | |
| --- | --- | --- |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `shortDescription?` | string | nullable |
| `sku?` | string | nullable |
| `brandType` | integer |  |
| `productType` | integer |  |
| `categoryId` | string(uuid) |  |
| `price?` | number | nullable |
| `compareAtPrice?` | number | nullable |
| `showPrice` | boolean |  |
| `stockQuantity?` | integer | nullable |
| `lowStockThreshold?` | integer | nullable |
| `trackInventory` | boolean |  |
| `isFeatured` | boolean |  |
| `displayOrder` | integer |  |
| `metaTitle?` | string | nullable |
| `metaDescription?` | string | nullable |
| `metaKeywords?` | string | nullable |
| `tags?` | string | nullable |
| `aiKeywords?` | string | nullable |
| `materialType?` | string | nullable |
| `qualityTier?` | string | nullable |
| `recommendedFor?` | string | nullable |
| `specifications?` | [`Products.SpecificationItemDto`](#s-products-specificationitemdto)[] | nullable |
| `keyFeatures?` | string[] | nullable |
| `whatsIncluded?` | string[] | nullable |
| `whatsNotIncluded?` | string[] | nullable |
| `dimensions?` | string | nullable |
| `warranty?` | string | nullable |
| `finishType?` | string | nullable |
| `installationType?` | string | nullable |
| `material?` | string | nullable |
| `color?` | string | nullable |
| `size?` | string | nullable |
| `variants?` | [`Products.CreateProductVariantDto`](#s-products-createproductvariantdto)[] | nullable |
| `images?` | [`Products.AddProductImageDto`](#s-products-addproductimagedto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-createproductreviewdto"></a>Products.CreateProductReviewDto

<sub>`TBM.Application.DTOs.Products.CreateProductReviewDto`</sub>

Body of: `POST /api/v1/products/{productId}/reviews`

| Property | Type | |
| --- | --- | --- |
| `rating` | integer |  |
| `title?` | string | nullable |
| `comment?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-createproductvariantdto"></a>Products.CreateProductVariantDto

<sub>`TBM.Application.DTOs.Products.CreateProductVariantDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `size?` | string | nullable |
| `price` | number |  |
| `stockQuantity` | integer |  |
| `isActive` | boolean |  |
| `displayOrder` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-productcarddto"></a>Products.ProductCardDto

<sub>`TBM.Application.DTOs.Products.ProductCardDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `name?` | string | nullable |
| `slug?` | string | nullable |
| `price?` | number | nullable |
| `image?` | string | nullable |
| `category?` | string | nullable |
| `inStock` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-productdto"></a>Products.ProductDto

<sub>`TBM.Application.DTOs.Products.ProductDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `shortDescription?` | string | nullable |
| `slug?` | string | nullable |
| `sku?` | string | nullable |
| `brandType` | integer |  |
| `brandName?` | string | nullable |
| `productType` | integer |  |
| `productTypeName?` | string | nullable |
| `categoryId` | string(uuid) |  |
| `categoryName?` | string | nullable |
| `price?` | number | nullable |
| `compareAtPrice?` | number | nullable |
| `showPrice` | boolean |  |
| `priceDisplay?` | string | nullable |
| `stockQuantity?` | integer | nullable |
| `inStock` | boolean |  |
| `trackInventory` | boolean |  |
| `isActive` | boolean |  |
| `isFeatured` | boolean |  |
| `displayOrder` | integer |  |
| `lowStockThreshold` | integer |  |
| `averageRating` | number |  |
| `reviewCount` | integer |  |
| `metaTitle?` | string | nullable |
| `metaDescription?` | string | nullable |
| `metaKeywords?` | string | nullable |
| `tags?` | string | nullable |
| `aiKeywords?` | string | nullable |
| `materialType?` | string | nullable |
| `qualityTier?` | string | nullable |
| `recommendedFor?` | string | nullable |
| `specifications?` | [`Products.SpecificationItemDto`](#s-products-specificationitemdto)[] | nullable |
| `keyFeatures?` | string[] | nullable |
| `whatsIncluded?` | string[] | nullable |
| `whatsNotIncluded?` | string[] | nullable |
| `dimensions?` | string | nullable |
| `warranty?` | string | nullable |
| `finishType?` | string | nullable |
| `installationType?` | string | nullable |
| `material?` | string | nullable |
| `color?` | string | nullable |
| `size?` | string | nullable |
| `variants?` | [`Products.ProductVariantDto`](#s-products-productvariantdto)[] | nullable |
| `images?` | [`Products.ProductImageDto`](#s-products-productimagedto)[] | nullable |
| `primaryImageUrl?` | string | nullable |
| `similarProducts?` | [`Products.ProductCardDto`](#s-products-productcarddto)[] | nullable |
| `createdAt` | string(date-time) |  |
| `updatedAt` | string(date-time) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-productimagedto"></a>Products.ProductImageDto

<sub>`TBM.Application.DTOs.Products.ProductImageDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `productId` | string(uuid) |  |
| `imageUrl?` | string | nullable |
| `altText?` | string | nullable |
| `viewType?` | string | nullable |
| `displayOrder` | integer |  |
| `isPrimary` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-productvariantdto"></a>Products.ProductVariantDto

<sub>`TBM.Application.DTOs.Products.ProductVariantDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `size?` | string | nullable |
| `price` | number |  |
| `stockQuantity` | integer |  |
| `isActive` | boolean |  |
| `displayOrder` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-specificationitemdto"></a>Products.SpecificationItemDto

<sub>`TBM.Application.DTOs.Products.SpecificationItemDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `key?` | string | nullable |
| `value?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-updatecategorydto"></a>Products.UpdateCategoryDto

<sub>`TBM.Application.DTOs.Products.UpdateCategoryDto`</sub>

Body of: `PUT /api/v1/Categories/{id}`

| Property | Type | |
| --- | --- | --- |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `parentCategoryId?` | string(uuid) | nullable |
| `imageUrl?` | string | nullable |
| `iconUrl?` | string | nullable |
| `displayOrder` | integer |  |
| `isActive` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-products-updateproductdto"></a>Products.UpdateProductDto

<sub>`TBM.Application.DTOs.Products.UpdateProductDto`</sub>

Body of: `PUT /api/v1/admin/AdminProducts/{id}`, `PUT /api/v1/Products/{id}`

| Property | Type | |
| --- | --- | --- |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `shortDescription?` | string | nullable |
| `sku?` | string | nullable |
| `categoryId` | string(uuid) |  |
| `price?` | number | nullable |
| `compareAtPrice?` | number | nullable |
| `showPrice` | boolean |  |
| `stockQuantity?` | integer | nullable |
| `lowStockThreshold?` | integer | nullable |
| `trackInventory` | boolean |  |
| `isActive` | boolean |  |
| `isFeatured` | boolean |  |
| `displayOrder` | integer |  |
| `metaTitle?` | string | nullable |
| `metaDescription?` | string | nullable |
| `metaKeywords?` | string | nullable |
| `tags?` | string | nullable |
| `aiKeywords?` | string | nullable |
| `materialType?` | string | nullable |
| `qualityTier?` | string | nullable |
| `recommendedFor?` | string | nullable |
| `specifications?` | [`Products.SpecificationItemDto`](#s-products-specificationitemdto)[] | nullable |
| `keyFeatures?` | string[] | nullable |
| `whatsIncluded?` | string[] | nullable |
| `whatsNotIncluded?` | string[] | nullable |
| `dimensions?` | string | nullable |
| `warranty?` | string | nullable |
| `finishType?` | string | nullable |
| `installationType?` | string | nullable |
| `material?` | string | nullable |
| `color?` | string | nullable |
| `size?` | string | nullable |
| `variants?` | [`Products.CreateProductVariantDto`](#s-products-createproductvariantdto)[] | nullable |
| `images?` | [`Products.AddProductImageDto`](#s-products-addproductimagedto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-projectrequests-createprojectrequestdto"></a>ProjectRequests.CreateProjectRequestDto

<sub>`TBM.Application.DTOs.ProjectRequests.CreateProjectRequestDto`</sub>

Body of: `POST /api/v1/project-requests/3d-model`, `POST /api/v1/project-requests/boq`, `POST /api/v1/project-requests/contact-designer`

| Property | Type | |
| --- | --- | --- |
| `estimateId?` | string(uuid) | nullable |
| `projectDescription?` | string | nullable |
| `contactName?` | string | nullable |
| `contactPhone?` | string | nullable |
| `contactEmail?` | string | nullable |
| `additionalNotes?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-savedcontroller-addsavedtocartrequest"></a>SavedController.AddSavedToCartRequest

<sub>`TBM.API.Controllers.V1.SavedController.AddSavedToCartRequest`</sub>

Body of: `POST /api/v1/Saved/{id}/add-to-cart`

| Property | Type | |
| --- | --- | --- |
| `quantity` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-savedcontroller-addtomoodboardrequest"></a>SavedController.AddToMoodboardRequest

<sub>`TBM.API.Controllers.V1.SavedController.AddToMoodboardRequest`</sub>

Body of: `POST /api/v1/Saved/{id}/add-to-moodboard`

| Property | Type | |
| --- | --- | --- |
| `boardId?` | string(uuid) | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-savedcontroller-buyallrequest"></a>SavedController.BuyAllRequest

<sub>`TBM.API.Controllers.V1.SavedController.BuyAllRequest`</sub>

Body of: `POST /api/v1/Saved/buy-all`

| Property | Type | |
| --- | --- | --- |
| `itemIds?` | string[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-savedcontroller-createboardrequest"></a>SavedController.CreateBoardRequest

<sub>`TBM.API.Controllers.V1.SavedController.CreateBoardRequest`</sub>

Body of: `POST /api/v1/Saved/create-board`

| Property | Type | |
| --- | --- | --- |
| `itemIds?` | string[] | nullable |
| `boardName?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-savedcontroller-saveitemrequest"></a>SavedController.SaveItemRequest

<sub>`TBM.API.Controllers.V1.SavedController.SaveItemRequest`</sub>

Body of: `POST /api/v1/Saved`

| Property | Type | |
| --- | --- | --- |
| `itemId` | string(uuid) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-settings-adminnotificationsettingsdto"></a>Settings.AdminNotificationSettingsDto

<sub>`TBM.Application.DTOs.Settings.AdminNotificationSettingsDto`</sub>

Body of: `PUT /api/v1/admin/settings/notifications`

| Property | Type | |
| --- | --- | --- |
| `emailEnabled` | boolean |  |
| `smsEnabled` | boolean |  |
| `pushEnabled` | boolean |  |
| `webhookEnabled` | boolean |  |
| `lowStockAlerts` | boolean |  |
| `highValueOrderAlerts` | boolean |  |
| `paymentFailureAlerts` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-settings-aimodeldto"></a>Settings.AIModelDto

<sub>`TBM.Application.DTOs.Settings.AIModelDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id?` | string | nullable |
| `enabled` | boolean |  |
| `apiKey?` | string | nullable |
| `maxTokens` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-settings-aisettingsdto"></a>Settings.AISettingsDto

<sub>`TBM.Application.DTOs.Settings.AISettingsDto`</sub>

Body of: `PUT /api/v1/admin/settings/ai`

| Property | Type | |
| --- | --- | --- |
| `rateLimit` | integer |  |
| `timeoutSeconds` | integer |  |
| `models?` | [`Settings.AIModelDto`](#s-settings-aimodeldto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-settings-generalsettingsdto"></a>Settings.GeneralSettingsDto

<sub>`TBM.Application.DTOs.Settings.GeneralSettingsDto`</sub>

Body of: `PUT /api/v1/admin/settings/general`

| Property | Type | |
| --- | --- | --- |
| `platformName?` | string | nullable |
| `supportEmail?` | string | nullable |
| `maintenanceMode` | boolean |  |
| `apiRateLimit` | integer |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-settings-paymentgatewaydto"></a>Settings.PaymentGatewayDto

<sub>`TBM.Application.DTOs.Settings.PaymentGatewayDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id?` | string | nullable |
| `enabled` | boolean |  |
| `publicKey?` | string | nullable |
| `secretKey?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-settings-paymentsettingsdto"></a>Settings.PaymentSettingsDto

<sub>`TBM.Application.DTOs.Settings.PaymentSettingsDto`</sub>

Body of: `PUT /api/v1/admin/settings/payment`

| Property | Type | |
| --- | --- | --- |
| `basePlatformFee` | number |  |
| `fixedFeePerTransaction` | number |  |
| `defaultCurrency?` | string | nullable |
| `gateways?` | [`Settings.PaymentGatewayDto`](#s-settings-paymentgatewaydto)[] | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-settings-toggleenableddto"></a>Settings.ToggleEnabledDto

<sub>`TBM.Application.DTOs.Settings.ToggleEnabledDto`</sub>

Body of: `PATCH /api/v1/admin/settings/payment/gateways/{gatewayId}`, `PATCH /api/v1/admin/settings/ai/models/{modelId}`

| Property | Type | |
| --- | --- | --- |
| `enabled` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-subscriptions-activatesubscriptiondto"></a>Subscriptions.ActivateSubscriptionDto

<sub>`TBM.Application.DTOs.Subscriptions.ActivateSubscriptionDto`</sub>

Body of: `POST /api/v1/subscription/activate`

| Property | Type | |
| --- | --- | --- |
| `reference?` | string | nullable |
| `tier` | [`SubscriptionTier`](#s-subscriptiontier) |  |
| `cycle` | [`BillingCycle`](#s-billingcycle) |  |
| `promoCode?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-subscriptions-consultationfeedto"></a>Subscriptions.ConsultationFeeDto

<sub>`TBM.Application.DTOs.Subscriptions.ConsultationFeeDto`</sub>

| Property | Type | |
| --- | --- | --- |
| `id` | string(uuid) |  |
| `consultationType?` | string | nullable |
| `fee` | number |  |
| `currency?` | string | nullable |
| `location?` | string | nullable |
| `creditedTowardProject` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-subscriptions-creatediscountdto"></a>Subscriptions.CreateDiscountDto

<sub>`TBM.Application.DTOs.Subscriptions.CreateDiscountDto`</sub>

Body of: `POST /api/v1/admin/AdminDiscounts`

| Property | Type | |
| --- | --- | --- |
| `code?` | string | nullable |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `type?` | string | nullable |
| `value` | number |  |
| `applicableTier?` | string | nullable |
| `applicableBillingCycle?` | string | nullable |
| `startsAt` | string(date-time) |  |
| `expiresAt` | string(date-time) |  |
| `maxRedemptions?` | integer | nullable |
| `singleUsePerUser` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-subscriptions-subscribetoplandto"></a>Subscriptions.SubscribeToPlanDto

<sub>`TBM.Application.DTOs.Subscriptions.SubscribeToPlanDto`</sub>

Body of: `POST /api/v1/subscription/subscribe`, `POST /api/v1/subscription/upgrade`

| Property | Type | |
| --- | --- | --- |
| `tier` | [`SubscriptionTier`](#s-subscriptiontier) |  |
| `cycle` | [`BillingCycle`](#s-billingcycle) |  |
| `promoCode?` | string | nullable |
| `callbackUrl?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-subscriptions-updatediscountdto"></a>Subscriptions.UpdateDiscountDto

<sub>`TBM.Application.DTOs.Subscriptions.UpdateDiscountDto`</sub>

Body of: `PUT /api/v1/admin/AdminDiscounts/{id}`

| Property | Type | |
| --- | --- | --- |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `value` | number |  |
| `expiresAt` | string(date-time) |  |
| `maxRedemptions?` | integer | nullable |
| `isActive` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-subscriptions-updatepricingconfigdto"></a>Subscriptions.UpdatePricingConfigDto

<sub>`TBM.Application.DTOs.Subscriptions.UpdatePricingConfigDto`</sub>

Body of: `PUT /api/v1/admin/AdminPricing/{tier}/{cycle}`

| Property | Type | |
| --- | --- | --- |
| `price` | number |  |
| `generationsPerMonth` | integer |  |
| `prioritySupport` | boolean |  |
| `unlimitedGenerations` | boolean |  |
| `displayName?` | string | nullable |
| `description?` | string | nullable |
| `features?` | string[] | nullable |
| `isActive` | boolean |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-activatevendorrequest"></a>Vendor.ActivateVendorRequest

<sub>`TBM.Application.DTOs.Vendor.ActivateVendorRequest`</sub>

Body of: `POST /api/v1/admin/vendors/{userId}/activate`

| Property | Type | |
| --- | --- | --- |
| `displayName?` | string | nullable |
| `slaHours?` | integer | nullable |
| `tenantId?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-assignproductownerrequest"></a>Vendor.AssignProductOwnerRequest

<sub>`TBM.Application.DTOs.Vendor.AssignProductOwnerRequest`</sub>

Body of: `POST /api/v1/admin/vendors/products/{productId}/assign`

| Property | Type | |
| --- | --- | --- |
| `vendorUserId` | string(uuid) |  |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-vendordeliveryupdaterequest"></a>Vendor.VendorDeliveryUpdateRequest

<sub>`TBM.Application.DTOs.Vendor.VendorDeliveryUpdateRequest`</sub>

Body of: `PATCH /api/v1/vendor/deliveries/{orderId}`

| Property | Type | |
| --- | --- | --- |
| `deliveryPartner?` | string | nullable |
| `trackingNumber?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-vendorinventorycreaterequest"></a>Vendor.VendorInventoryCreateRequest

<sub>`TBM.Application.DTOs.Vendor.VendorInventoryCreateRequest`</sub>

Body of: `POST /api/v1/vendor/inventory/products`, `POST /api/v1/inventory/products`

| Property | Type | |
| --- | --- | --- |
| `name?` | string | nullable |
| `description?` | string | nullable |
| `shortDescription?` | string | nullable |
| `categoryId` | string(uuid) |  |
| `sku?` | string | nullable |
| `brandType?` | integer | nullable |
| `productType?` | integer | nullable |
| `price?` | number | nullable |
| `stockQuantity` | integer |  |
| `lowStockThreshold?` | integer | nullable |
| `isActive` | boolean |  |
| `trackInventory?` | boolean | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-vendorinventoryupdaterequest"></a>Vendor.VendorInventoryUpdateRequest

<sub>`TBM.Application.DTOs.Vendor.VendorInventoryUpdateRequest`</sub>

Body of: `PUT /api/v1/vendor/inventory/{productId}`

| Property | Type | |
| --- | --- | --- |
| `stockQuantity` | integer |  |
| `lowStockThreshold?` | integer | nullable |
| `isActive?` | boolean | nullable |
| `price?` | number | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-vendormessagecreaterequest"></a>Vendor.VendorMessageCreateRequest

<sub>`TBM.Application.DTOs.Vendor.VendorMessageCreateRequest`</sub>

Body of: `POST /api/v1/vendor/messages`

| Property | Type | |
| --- | --- | --- |
| `subject?` | string | nullable |
| `body?` | string | nullable |
| `to?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-vendororderassignmentrequest"></a>Vendor.VendorOrderAssignmentRequest

<sub>`TBM.Application.DTOs.Vendor.VendorOrderAssignmentRequest`</sub>

Body of: `PATCH /api/v1/vendor/orders/{orderId}/assignment`

| Property | Type | |
| --- | --- | --- |
| `deliveryAgentName?` | string | nullable |
| `deliveryAgentPhone?` | string | nullable |
| `assignmentNote?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-vendorordernoterequest"></a>Vendor.VendorOrderNoteRequest

<sub>`TBM.Application.DTOs.Vendor.VendorOrderNoteRequest`</sub>

Body of: `POST /api/v1/vendor/orders/{orderId}/notes`

| Property | Type | |
| --- | --- | --- |
| `note?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>

### <a id="s-vendor-vendororderstatusupdaterequest"></a>Vendor.VendorOrderStatusUpdateRequest

<sub>`TBM.Application.DTOs.Vendor.VendorOrderStatusUpdateRequest`</sub>

Body of: `PATCH /api/v1/vendor/orders/{orderId}/status`

| Property | Type | |
| --- | --- | --- |
| `status` | [`OrderStatus`](#s-orderstatus) |  |
| `note?` | string | nullable |

<sub>`additionalProperties: false` — unknown keys are rejected.</sub>
