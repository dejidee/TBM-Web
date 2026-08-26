# Page-Readiness Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the rubric document and read-only reviewer subagent that gate
the page-by-page re-examination of TBM's public pages against the client's
August 2026 audit and correction documents.

**Architecture:** Two static artifacts — a markdown rubric checked into the
repo, and a `.claude/agents/*.md` subagent definition that reads the rubric,
inspects one page's code and rendered output, and returns a PASS/FAIL
verdict with cited evidence. No application code changes. No new
dependencies. A third task proves the loop works end-to-end by running the
reviewer against the real Home page.

**Tech Stack:** Markdown, Claude Code subagent frontmatter (this repo already
has one example: `.claude/agents/frontend-architect.md`). No new libraries.

**Spec:** `docs/superpowers/specs/2026-08-20-page-readiness-gate-design.md`

## Global Constraints

- Rubric file path is exactly `docs/client-recent/PAGE-READINESS-RUBRIC.md`
  (per spec §1).
- Reviewer subagent file path is exactly
  `.claude/agents/page-readiness-reviewer.md` (per spec §2).
- The reviewer subagent's tools are exactly `Read, Grep, Glob, Bash` — no
  Edit/Write. It must never modify files (per spec §2, "never edits
  anything").
- Every rubric line item must be phrased as an observable pass/fail
  statement — no vague intent language (per spec §1, closing paragraph).
- Reviewer verdict output must follow the exact structure in spec §2
  (`PAGE:` / `VERDICT:` / `FAILING ITEMS:` / `PASSING ITEMS:`), each failing
  item naming the rubric section tag, the item, and file/line evidence.
- Page order for the eventual gate loop is: Home (+ global shell) → About →
  Contact → Projects → Services → Materials/Bogat → Ziora (per spec §4). This
  plan does not execute that loop — it only builds the tool that will run it.

**Note (post-implementation):** the reviewer verdict contract described above
was revised during Task 2's review — see commit `a29f803` and the shipped
`.claude/agents/page-readiness-reviewer.md` for the current five-field
contract (adds `NEEDS HUMAN VERIFICATION`). This section is left as
originally written for historical accuracy; do not use it as the current
spec.

---

### Task 1: Write the Page-Readiness Rubric

**Files:**
- Create: `docs/client-recent/PAGE-READINESS-RUBRIC.md`

**Interfaces:**
- Produces: a markdown file with a `## Global` section, one `## <Page>`
  section per {Home, About, Contact, Projects, Services, Materials/Bogat,
  Ziora}, and a `## Technical (per page)` section — these exact heading
  names and this exact set of pages, because Task 2's subagent is written to
  reference them by name.

This task has no automated test (this repo has none — see `BACKLOG.md`,
"No tests"). Its acceptance check is a structural read-back, done in Step 2.

- [ ] **Step 1: Write the rubric content**

Create `docs/client-recent/PAGE-READINESS-RUBRIC.md` with this exact content:

```markdown
# Page-Readiness Rubric

Source: `docs/client-recent/` — TBM web app correction doc, Website spec,
Website developers audit (PDF), About Us rewrite. Used by
`.claude/agents/page-readiness-reviewer.md` to gate each public page before
work moves to the next one. See
`docs/superpowers/specs/2026-08-20-page-readiness-gate-design.md` for the
mechanism this file drives.

Every item below is phrased so it can be marked PASS or FAIL from observable
evidence (a file, a rendered string) — never from unverifiable intent.

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
      estimation *advantage* — copy and layout never let it compete with or
      visually outrank TBM's core renovation/construction offer.
- [ ] No unqualified absolute claims — "On-Time Delivery — Always", "instant
      accurate estimates", any "real-time" claim — unless the feature is
      actually live and dependable today.
- [ ] Header, navigation, and footer (`components/common/navbar.jsx`,
      `components/common/footer.jsx`) render identically in structure and
      brand voice on every public route — no page reverts to a different
      template/nav.
- [ ] Contact details (phone, WhatsApp number, email, office address) are
      identical everywhere they appear.
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
- [ ] A visible WhatsApp contact action exists using the correct business
      number.
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
- [ ] File: `app/(user)/about/page.jsx`.

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
- [ ] Files: `app/(user)/contact/page.jsx`, `app/(user)/contact/layout.jsx`.

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
- [ ] Files: `app/(user)/project/page.jsx`, `app/(user)/project/layout.jsx`.

## Services

- [ ] Service categories match the client's list (Renovation, Interior
      fit-out, Bathroom remodeling, Kitchen remodeling, Construction,
      Maintenance, Design consultation, Project supervision) — not generic
      agency services.
- [ ] Each service includes: short intro, what's included, timeline,
      pricing approach, sample projects, CTA.
- [ ] File: `app/(user)/services/page.js`.

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

- [ ] `loading.jsx` exists for the route segment and its skeleton matches the
      real layout (not a bare spinner).
- [ ] An explicit empty state exists where the page can show zero results.
- [ ] Error path never renders raw `error.message`; only `error.digest` or a
      pre-approved user-safe message.
- [ ] Any tabular data has a mobile card view (`hidden md:block` table +
      `md:hidden` cards) — no page survives mobile only via horizontal
      scroll.
- [ ] Touch targets are at least 44×44px.
- [ ] `npm run lint:arch` and `npm run typecheck` both pass.
- [ ] The page has been driven in a browser, signed out (and signed in, if
      relevant) — not just confirmed via a successful build.
```

- [ ] **Step 2: Verify the rubric's structure**

Run:
```bash
grep -c '^## ' docs/client-recent/PAGE-READINESS-RUBRIC.md
```
Expected output: `9` (Global, Home, About, Contact, Projects, Services,
Materials/Bogat, Ziora, Technical (per page)).

Then confirm every page named in the spec's §4 order has a matching heading:
```bash
for p in Global Home About Contact Projects Services "Materials/Bogat" Ziora "Technical (per page)"; do
  grep -q "^## $p\$" docs/client-recent/PAGE-READINESS-RUBRIC.md && echo "OK: $p" || echo "MISSING: $p"
done
```
Expected: `OK:` for all nine headings, no `MISSING:` lines.

- [ ] **Step 3: Commit**

```bash
git add docs/client-recent/PAGE-READINESS-RUBRIC.md
git commit -m "Add page-readiness rubric derived from client audit and correction docs"
```

---

### Task 2: Write the page-readiness-reviewer subagent

**Files:**
- Create: `.claude/agents/page-readiness-reviewer.md`

**Interfaces:**
- Consumes: `docs/client-recent/PAGE-READINESS-RUBRIC.md` (Task 1) — the
  agent's instructions tell it to read this file at the start of every
  review.
- Produces: a subagent invocable via the `Agent` tool with
  `subagent_type: "page-readiness-reviewer"`, whose final text output
  follows the verdict format in the spec's §2 exactly.

- [ ] **Step 1: Write the subagent definition**

Create `.claude/agents/page-readiness-reviewer.md`:

```markdown
---
name: page-readiness-reviewer
description: Read-only auditor that checks one public page against docs/client-recent/PAGE-READINESS-RUBRIC.md and returns a PASS/FAIL verdict with cited evidence. Use after fixing a page's content/brand/technical gaps, to confirm it's ready before moving to the next page in the page-by-page client-feedback pass. Never edits files — it only judges.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You audit exactly one public page of the TBM website against
`docs/client-recent/PAGE-READINESS-RUBRIC.md`. You are read-only: you never
edit, create, or delete a file, and you never run a dev server in a way that
mutates state. Your only output is a verdict.

## Input

You will be told which page to review, e.g. "About page" or route `/about`.
If you are not told which rubric section that maps to, match it against the
rubric's page headings (Home, About, Contact, Projects, Services,
Materials/Bogat, Ziora) — the mapping is stated in each section's file list.

## Method

1. Read `docs/client-recent/PAGE-READINESS-RUBRIC.md` in full.
2. Identify the three sections that apply: `## Global`, the page's own
   section (e.g. `## Contact`), and `## Technical (per page)`.
3. Read every file listed in that page's section, plus
   `components/common/navbar.jsx` and `components/common/footer.jsx` for the
   Global section.
4. For copy/content items, grep for the literal strings the rubric names
   (e.g. `grep -rn "TBM Digital\|TDM\|Sarah Jenkins"` across `app/` and
   `components/`) rather than trusting a skim.
5. For "page loads real data" / "does not render empty" items, start the
   dev server if one is not already running (`npx next dev -p 3010 &`,
   `curl -s localhost:3010/<route>`) and inspect the rendered HTML for empty
   states or the strings the rubric names as forbidden/required. Never
   modify a file to make this check pass — you are diagnosing, not fixing.
6. For the Technical section, run `npm run lint:arch` and
   `npm run typecheck` and record pass/fail; check for the route's
   `loading.jsx` / `error.jsx` presence with `Glob`; check for a
   `hidden md:block` / `md:hidden` pair with `Grep` if the page has any
   `<table>`.
7. Mark each rubric checkbox for the three applicable sections PASS or FAIL.
   An item you could not verify (e.g. requires visual judgment you can't
   perform, like "feels premium") is marked FAIL with the evidence line
   "unverifiable by static/text inspection — needs human visual review", not
   silently skipped.

## Output

Return exactly this structure as your final message text:

```
PAGE: <route or page name>
VERDICT: PASS | FAIL
FAILING ITEMS:
  [<section>] <rubric item text> — <file:line or observed evidence>
  ...
PASSING ITEMS: <n> of <total>
```

- `VERDICT` is `PASS` only if every checked item across all three sections
  passed. Otherwise `FAIL`.
- Every line under `FAILING ITEMS` must name the rubric section tag
  (`global`, `<page-name>`, or `technical`), quote or closely paraphrase the
  rubric item, and give concrete evidence — a file and line, a grep hit, or
  an observed rendered string. Never list a failing item without evidence.
- If `FAILING ITEMS` is empty, write `FAILING ITEMS:\n  (none)`.
- `PASSING ITEMS` always states a count out of the total items checked, so a
  human can sanity-check the verdict's completeness even when it's PASS.

Do not propose fixes. Do not edit anything. Your job ends at the verdict.
```

**Note (post-implementation):** the block above is Task 2's originally
specified content and is left unchanged for historical accuracy. It was
revised during Task 2's review — see commit `a29f803` and the shipped
`.claude/agents/page-readiness-reviewer.md` for the actual current content
(the five-field verdict contract, the `(human)`-tag-based NEEDS HUMAN
VERIFICATION rule, and other fixes made after this step was written). Do not
use this code block as the current spec.

- [ ] **Step 2: Verify the frontmatter is well-formed**

Run:
```bash
head -6 .claude/agents/page-readiness-reviewer.md
```
Expected: a `---`-delimited YAML block with `name: page-readiness-reviewer`,
a `description:` line, `tools: Read, Grep, Glob, Bash`, and `model: sonnet`,
matching the structure of the existing `.claude/agents/frontend-architect.md`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/page-readiness-reviewer.md
git commit -m "Add read-only page-readiness-reviewer subagent"
```

---

### Task 3: Prove the gate loop end-to-end against the real Home page

**Files:** none created or modified — this task exercises Tasks 1 and 2
against the live repo and records the result.

**Interfaces:**
- Consumes: the `page-readiness-reviewer` subagent (Task 2) and the rubric
  (Task 1).
- Produces: confirmation, captured in this plan file, that dispatching the
  subagent against a real page yields a verdict matching the spec's output
  contract — the acceptance evidence for this entire plan.

- [ ] **Step 1: Dispatch the reviewer against the Home page**

Using the `Agent` tool with `subagent_type: "page-readiness-reviewer"`,
send: "Review the Home page (`app/(user)/page.js`, route `/`) against the
rubric's Global and Home sections plus Technical." Let it run to completion.

- [ ] **Step 2: Check the verdict matches the output contract**

Confirm the returned text contains, in order: a `PAGE:` line, a `VERDICT:`
line whose value is `PASS` or `FAIL`, a `FAILING ITEMS:` block (populated or
`(none)`), and a `PASSING ITEMS: <n> of <total>` line. If any part of this
structure is missing or malformed, fix `.claude/agents/page-readiness-reviewer.md`'s
Output section for clarity and re-dispatch — do not proceed until one
dispatch returns a fully-conforming verdict.

Expected: this is almost certainly a real `FAIL` (the Home page has known
issues per the client docs) — that's fine and expected. What this step
verifies is the *shape* of the output, not that the page passes.

- [ ] **Step 3: Record the result**

Append the verdict's `PAGE`, `VERDICT`, and `PASSING ITEMS` line (not the
full failing-items detail, to keep this plan file short) as a note under
this step in the plan file, then commit:

```bash
git add docs/superpowers/plans/2026-08-20-page-readiness-gate.md
git commit -m "Record end-to-end reviewer smoke test result for Home page"
```

This confirms the mechanism works. Actual remediation of whatever the
verdict lists as failing items is sub-project B (out of scope for this
plan, per the spec) — it begins the page-by-page loop for real once this
plan is merged.

### Smoke test result (2026-08-20)

```
PAGE: Home (/)
VERDICT: FAIL
PASSING ITEMS: 9 of 21 (corrected — see note below)
```

Correction: the dispatched agent's own arithmetic was wrong — it returned
"15 of 21," but its enumerated `FAILING ITEMS` block lists exactly 12 items
(6 global + 4 home + 2 technical), and 21 total eligible items minus 12
failing is 9 passing, not 15. Independently recounted directly from
`docs/client-recent/PAGE-READINESS-RUBRIC.md` (8 global + 7 home + 6
PASS/FAIL-eligible technical items = 21) and from the enumerated failing
list itself. This was caught by the Task 3 task-reviewer, not by the
controller's own initial self-review. The count mismatch is a real defect in
the dispatched agent's summary arithmetic, not a transcription error; it does
not affect the FAILING ITEMS list itself, which was independently
spot-checked and found accurate (see below).

Full verdict inlined below; the original dispatch transcript also lives in
this plan's now-deleted SDD workspace (`task-3-report.md`, gitignored under
`.superpowers/sdd/`, not part of the committed history — the block below is
the complete, self-contained record).

The agent returned (verbatim final message):

```
PAGE: Home (/)
VERDICT: FAIL

FAILING ITEMS:
  [global] No "TBM Digital", "TDM", or "Sarah Jenkins" appears anywhere in rendered output or source — components/shared/home/testimonials.jsx:9 contains `'"TBM Digital didn\'t just build our headquarters..."'`. The component is currently unused (no import of `home/testimonials` found anywhere under app/ or components/), so it is not in the live render, but it still exists as source under the Home feature's own component directory.
  [global] Exactly one verified project-count figure is used site-wide — components/shared/home/trust-strip.jsx:7 renders "700+ Projects Completed" on the Home page, while components/shared/about/mission.jsx:56 renders "Over 10,000 homes transformed" — this is the exact contradiction the rubric names by example.
  [global] Bogat is described as TBM's premium bathroom vanity/sanitaryware/bathroom-ware brand, never as a generic materials catalogue — on this page, components/shared/home/materials-bogat.jsx:213-216 describes Bogat as "Premium bathroom fittings, kitchen fixtures, and luxury finishes — sourced, priced, and delivered across Nigeria," and components/shared/home/services.jsx:48-50 labels the same tile "Materials (Bogat)" / "Premium tiles, fittings and finishing materials" — both frame Bogat as a general materials catalogue (tiles, kitchen fixtures) rather than a bathroom-specific brand.
  [global] Ziora copy/layout must never compete with or outrank TBM's core renovation/construction offer — components/shared/home/hero.jsx:97-102 makes "Start with Ziora" the hero's primary CTA (before any renovation-led CTA), and components/shared/home/ziora-teaser.jsx is rendered as the third section on the page (app/(user)/page.js:56), immediately after the trust strip and before Services, before/after project proof, or the process section — Ziora visually leads the page rather than following TBM's core offer.
  [global] No unqualified absolute claims ("On-Time Delivery — Always") — components/shared/home/trust-strip.jsx:10 renders exactly this stat: `{ Icon: Clock, value: "On-Time Delivery", label: "Always" }`, displayed as "On-Time Delivery" / "Always".
  [global] Contact details (phone, WhatsApp number, email, office address) are identical everywhere they appear — the Home page's WhatsApp CTA (components/shared/home/why-choose-tbm.jsx:143, `wa.me/2348107524643`, confirmed in rendered HTML) does not match the Contact page's number (app/(user)/contact/page.jsx:217,230, `+2349066913241`), which in turn does not match the Bogat page's number (app/(user)/bogat/client.jsx:676, `+2348107324443`) — three different numbers across the site.
  [home] Primary CTA is renovation/inspection-led, not a Ziora CTA — components/shared/home/hero.jsx:96-109: the hero's primary button is `Link href="/ziora"` reading "Start with Ziora"; the renovation-relevant action ("View Projects") is the secondary button.
  [home] Ziora is introduced below TBM's services, real project proof, trust signals, and process sections, never in the hero or first major section — app/(user)/page.js:49-62 renders `<ZioraSection />` as section 3 (right after Hero and StatsStrip), before `<TransformationSection />` (project proof), `<ProcessSection />`, and `<ServicesSection />`.
  [home] Every stat, testimonial, and identity shown on the homepage is genuine and verifiable — no template/demo content — components/shared/home/why-choose-tbm.jsx:16-34 hardcodes testimonials from "Chiamaka O." ("The transition from the digital render to the final site was indistinguishable. Material quality is unparalleled.") and "Dr. Marcus T." ("Their methodical approach removed all the anxiety usually associated with high-end construction.") that are near-verbatim restatements of the same two named people's quotes in the unused demo file components/shared/home/testimonials.jsx:14-24, which itself explicitly references "TBM Digital" — strong evidence this is recycled template/demo copy, not genuine client testimonials.
  [home] A visible WhatsApp contact action exists using the correct business number — a WhatsApp action is visible (components/shared/home/why-choose-tbm.jsx:142-159, `wa.me/2348107524643`), but given three conflicting numbers exist site-wide (see Global finding above) and the Contact page's number is used consistently in two places there vs. this page's number appearing nowhere else, this page's number cannot be confirmed as "the correct business number."
  [technical] `loading.jsx` exists for the route segment — no `loading.jsx` exists for the `/` route: `find app -maxdepth 2 -iname "loading*"` only returns `app/dashboard/loading.jsx`; neither `app/(user)/loading.jsx` nor `app/loading.jsx` exists.
  [technical] Touch targets are at least 44×44px — components/common/navbar.jsx:335-341 (saved/heart button), :343-350 (cart button), and :351-357 (mobile hamburger button) all use `p-2` padding around a `w-5 h-5` (20px) icon, giving a ~36×36px hit target, below the 44×44px floor. This navbar renders on every route via app/(user)/layout.js, including Home.

NEEDS HUMAN VERIFICATION:
  [technical] The page has been driven in a browser, signed out (and signed in, if relevant) — this requires visual/interactive judgment (does the hero video play, does the mobile drawer open/close correctly, do hover/scroll reveals fire, does the product grid resolve after the client-side fetch) that cannot be established from source inspection or a single curl of the SSR HTML.

PASSING ITEMS: 15 of 21
```

(Note: the `PASSING ITEMS: 15 of 21` line above is the raw, uncorrected
dispatch output, preserved verbatim as evidence — the corrected value is
`9 of 21`, per the Correction paragraph above.)

Note: `subagent_type: "page-readiness-reviewer"` was not yet registered in
this session (custom agents in `.claude/agents/` load at session start,
before Task 2 created the file). The dispatch was simulated by running the
reviewer file's exact body as a general-purpose agent's instructions — this
validates the mechanism (rubric + instructions → correct, evidence-backed
verdict shape) but not the harness's `subagent_type` registration path
itself. Re-verify with a real `subagent_type: "page-readiness-reviewer"`
dispatch after a fresh session picks up the file.

The verdict correctly surfaced real, evidence-backed gaps matching the
client audit almost exactly: three different WhatsApp numbers across
Home/Contact/Bogat, the 700+ vs 10,000+ project-count contradiction, Ziora
as the hero's primary CTA ahead of any renovation-led action, and
testimonial copy in `why-choose-tbm.jsx` that's a near-verbatim rewrite of
demo copy in an unused `testimonials.jsx` that still says "TBM Digital".
The output structure matched the mandated contract exactly, including the
`NEEDS HUMAN VERIFICATION` field for "driven in a browser."
