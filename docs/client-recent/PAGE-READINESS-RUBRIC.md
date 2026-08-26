# Page-Readiness Rubric

Source: `docs/client-recent/` — TBM web app correction doc, Website spec,
Website developers audit (PDF), About Us rewrite. Used by
`.claude/agents/page-readiness-reviewer.md` to gate each public page before
work moves to the next one. See
`docs/superpowers/specs/2026-08-20-page-readiness-gate-design.md` for the
mechanism this file drives.

**Document priority (client-confirmed, 2026-08-21):** where the source
documents disagree, `Website developers audit.pdf` wins. It's the newest
document and the only one written by reviewing the site as actually built —
the other documents (`TBM web app correction doc.docx`, `Website spec.docx`,
`tbmbuilding.com.docx`) predate it and, in places, describe an earlier
direction (e.g. a Ziora-forward hero, a general-materials framing for Bogat)
that the audit explicitly reverses. Every item below already reflects the
audit's version wherever the two conflicted; this note exists so a future
edit doesn't "correct" the rubric back toward an out-of-date document.

Every item below is phrased so it can be marked PASS or FAIL from observable
evidence (a file, a rendered string) — never from unverifiable intent. An item
whose checkbox is suffixed `(human)` is never marked PASS or FAIL by the
automated reviewer — it always goes in a separate human-verification list;
every other item must always be marked PASS or FAIL from evidence, never
skipped as "too subjective" — even a judgment call like "is this testimonial
genuine" must be resolved from what's actually readable in the code (e.g.
duplicate/recycled copy, a component that's provably unused, absence of any
real name/photo) rather than deferred to a human.

## Global

Checked on every page, because these live in shared components or are
site-wide consistency rules.

- [ ] No "TBM Digital", "TDM", or "Sarah Jenkins" appears anywhere in
      rendered output or source (`components/common/navbar.jsx`,
      `components/common/footer.jsx`, or any page).
- [ ] Exactly one verified project-count figure is used site-wide (the
      homepage's "700+" and the About page's "10,000+ homes transformed"
      must not both appear — audit flags this as a direct contradiction).
- [ ] Bogat is described as TBM's premium bathroom vanity / sanitaryware /
      bathroom-ware brand, never as a generic/general materials catalogue.
- [ ] Ziora is described as a TBM-assisted design, visualisation, and
      estimation _advantage_ — copy and layout never let it compete with or
      visually outrank TBM's core renovation/construction offer.
- [ ] No unqualified absolute claims — "On-Time Delivery — Always", "instant
      accurate estimates", any "real-time" claim — unless the feature is
      actually live and dependable today.
- [ ] Header, navigation, and footer (`components/common/navbar.jsx`,
      `components/common/footer.jsx`) render identically in structure and
      brand voice on every public route — no page reverts to a different
      template/nav.
- [ ] Contact details (phone, WhatsApp number, email, office address) are
      identical everywhere they appear. Canonical values established in the
      client audit (`Website developers audit.pdf`, Priority 4): website
      `www.tbmbuilding.com`, social handle `@tbmbuildingservices`.
      TODO(client): the audit's `info@tbmbuilding.com` was assumed canonical,
      but the live site also uses `support@tbmbuilding.com` in
      `app/(user)/privacy-policy/page.jsx` and elsewhere — two distinct real
      addresses, same unresolved-conflict shape as the phone number below.
      Confirm which email is correct (or if both are, and for what purpose
      each is used) before treating either as canonical.
      No canonical phone/WhatsApp number is established yet in the client
      docs either — for both fields, the check is only "identical everywhere
      it appears," not "matches a known-correct value"; finding multiple
      distinct numbers or addresses across pages is sufficient evidence for
      FAIL on its own, without needing to know which one is correct.
- [ ] Apple App Store / Google Play badges appear only if a real, live app
      exists; otherwise they are removed.

## Home

- [ ] Hero headline follows the client-approved direction (renovation/
      construction led, not generic "furniture" language) — e.g. "Design.
      Price. Build. All in one place." or equivalent per
      `docs/client-recent/Website spec.docx` §3.1.
- [ ] Primary CTA is renovation/inspection-led (e.g. "Book a Paid Site
      Inspection" or "Get Estimate") — not a Ziora CTA.
- [ ] Ziora is introduced below TBM's services, real project proof, trust
      signals, and process sections — never in the hero or first major
      section (audit, "Required positioning of Ziora").
- [ ] No irrelevant categories (chairs, workstations, generic office
      furniture) appear in any homepage shop/category section.
- [ ] Every stat, testimonial, and identity shown on the homepage is genuine
      and verifiable — no template/demo content.
- [ ] A visible WhatsApp contact action exists, using the same number that
      appears consistently elsewhere on the site (see Global — no single
      canonical number is established yet in the client docs, so flag it as
      a FAIL if this page's number doesn't match what's used elsewhere,
      without needing to know which number is "correct").
- [ ] `app/(user)/page.js` is the single source for this route (confirm no
      second competing homepage template is being rendered).

## About

- [ ] Content matches `docs/client-recent/About Us.docx` (or a verified
      equivalent) — TBM's real story, mission, and the three-arm structure
      (TBM = execution, Bogat = materials, Ziora = technology) — not generic
      agency/template copy.
- [ ] The project-count / "homes transformed" figure here matches the one
      figure used site-wide (see Global).
- [ ] No exaggerated or unverifiable claims.
- [ ] Page shares the same header/nav/footer template as Home (audit's "two
      different website identities" problem specifically calls out About).

Files to read: `app/(user)/about/page.jsx`.

## Contact

- [ ] No fabricated identity (e.g. "Sarah Jenkins") — real TBM team/contact
      details only.
- [ ] No unrelated services offered on this page (strategy design, content
      strategy, product design, brand strategy).
- [ ] "Book a Free Consultation" language is removed or corrected to reflect
      TBM's actual paid inspection/consultation process.
- [ ] Form collects: name, phone, location, project type, budget.
- [ ] Form routes to the correct pipeline per inquiry type (Design /
      Estimate / Book Project / Product inquiry), not a single undivided
      inbox.
- [ ] Office/showroom address, phone, WhatsApp, and email are present and
      match the Global section's values.

Files to read: `app/(user)/contact/page.jsx`, `app/(user)/contact/layout.jsx`.

## Projects

- [ ] No demo/placeholder project names ("Brooklyn Loft", "Scandinavian
      Kitchen", "Cozy Farmhouse") or placeholder figures (e.g. an unexplained
      "₦90k") remain anywhere on this page.
- [ ] Every project shown is a real Abuja/Lagos TBM project with location,
      scope, duration, and cost band.
- [ ] Before/after imagery is present per project (not stock photography
      presented as TBM work).
- [ ] Filters relevant to the Nigerian market are present (e.g. Bathrooms,
      Kitchens, Living rooms, Full home renovation, Commercial,
      Construction).
- [ ] A "Start Similar Project" (or equivalent) CTA exists per project.

Files to read: `app/(user)/project/page.jsx`, `app/(user)/project/layout.jsx`.

## Services

- [ ] Service categories match the client's list (Renovation, Interior
      fit-out, Bathroom remodeling, Kitchen remodeling, Construction,
      Maintenance, Design consultation, Project supervision) — not generic
      agency services.
- [ ] Each service includes: short intro, what's included, timeline,
      pricing approach, sample projects, CTA.

Files to read: `app/(user)/services/page.js`.

## Materials/Bogat

- [ ] Page loads real product/category data — does not render an empty
      result set (correction doc flags this as a currently broken state).
- [ ] Real categories are present (Bathroom, Kitchen, Tiles, Plumbing,
      Electrical, etc.), not placeholders.
- [ ] Product cards show image, price (or "Request Price"), description, and
      a CTA.
- [ ] Bogat is positioned per the Global section (premium bathroom brand,
      not general materials).
- [ ] Files: `app/(user)/materials/page.jsx`, `app/(user)/materials/client.jsx`,
      `app/(user)/bogat/page.jsx`, `app/(user)/bogat/client.jsx` — note both
      routes currently exist; the reviewer must flag if they present
      conflicting or duplicated Bogat positioning.

## Ziora

- [ ] All copy says "Design with Ziora" — no remaining "AI Visualizer" or
      "Ask our AI" branding (correction doc, brand structure correction).
- [ ] User flow is simplified to: Upload → Choose style → Generate →
      Continue (matches the client's simplified flow, not a longer one).
- [ ] Next-action CTAs after generation exist: "Continue to Estimate" /
      "Start Project with TBM" (or equivalent).
- [ ] Only features that currently work are described; unavailable
      functionality is labeled "Coming Soon" or removed, not implied as
      live.
- [ ] Files: `app/(user)/ziora/page.jsx`, `app/(user)/ai-visualizer/page.jsx`,
      `app/(user)/ai-gallery/page.jsx` — reviewer must flag if these three
      routes present inconsistent or duplicated Ziora entry points.

## Technical (per page)

Reused from `CLAUDE.md`'s Feature Checklist — applies to whichever page is
under review.

- [ ] If the route segment awaits data (a fetch, a DB call, anything async
      before render), `loading.jsx` exists for it and its skeleton matches
      the real layout (not a bare spinner). A fully synchronous route needs
      no `loading.jsx`.
- [ ] An explicit empty state exists where the page can show zero results.
- [ ] Error path never renders raw `error.message`; only `error.digest` or a
      pre-approved user-safe message.
- [ ] Any tabular data has a mobile card view (`hidden md:block` table +
      `md:hidden` cards) — no page survives mobile only via horizontal
      scroll.
- [ ] Touch targets are at least 44×44px.
- [ ] `npm run lint:arch` and `npm run typecheck` both pass.
- [ ] The page has been driven in a browser, signed out (and signed in, if
      relevant) — not just confirmed via a successful build. (human)
