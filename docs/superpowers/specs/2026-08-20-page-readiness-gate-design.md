# Page-readiness gate: design

Date: 2026-08-20
Status: approved for implementation

## Background

The client sent seven documents (`docs/client-recent/`) after a professional
website audit: a correction document, a full rebuild spec, an internal
"Ziora master AI" product spec, an "About Us" rewrite, and a formal audit PDF
scoring the current site 5.5/10 overall — 8/10 on homepage appearance but
4/10 on content credibility. The audit's core finding: the site mixes a new
TBM Building Services identity with leftover "TBM Digital/TDM" template
content, demo projects ("Brooklyn Loft", "Cozy Farmhouse"), a fabricated
contact ("Sarah Jenkins"), conflicting stats (700+ vs 10,000+ projects), and
lets Ziora visually compete with TBM's core offer instead of supporting it.

This project re-examines every public page against that feedback, one page
at a time, and does not move to the next page until the current one passes.
That requires a fixed, checkable definition of "passes" — this spec is that
definition plus the mechanism that applies it.

## Scope

This spec covers **sub-project A only**: the rubric and the gate mechanism.
**Sub-project B** — actually fixing each page's content, data, and IA against
the rubric — is follow-on work, executed page by page using what this spec
produces. It is not designed here.

## 1. The rubric

**Location:** `docs/client-recent/PAGE-READINESS-RUBRIC.md`, checked into
the repo — same status as `BACKLOG.md`: a living, referenced document, not a
one-time artifact.

**Structure:**

- **Global section** — checked on every page because it lives in shared
  components (Navbar, Footer) or is a site-wide consistency rule:
  - No "TBM Digital", "TDM", or "Sarah Jenkins" anywhere.
  - Exactly one verified project-count figure used site-wide (not 700+ in
    one place and 10,000+ in another).
  - Bogat is described as TBM's premium bathroom vanity / sanitaryware /
    bathroom-ware brand — never a generic materials catalogue.
  - Ziora is described as a TBM-assisted design, visualisation, and
    estimation *advantage* — never phrased or laid out so it competes with
    or outranks TBM's core renovation/construction offer.
  - No unqualified absolute claims ("On-Time Delivery — Always", "instant
    accurate estimates", real-time functionality) unless the feature is
    actually live and dependable.
  - Header, navigation, and footer are visually and structurally identical
    across pages (the audit's "two different website identities" problem).
  - Contact details (phone, WhatsApp, email, address) are consistent
    site-wide and match `docs/client-recent` source-of-truth values.
  - App Store / Google Play badges only appear if a real, live app exists.

- **Per-page section**, one for each of: Home, About, Contact, Projects,
  Services, Materials/Bogat, Ziora. Each item is transcribed as a testable
  pass/fail statement pulled directly from the three client documents, e.g.:
  - Projects: "Every project card shows a real Abuja/Lagos project with
    location, scope, duration, and cost band — no 'Brooklyn Loft', no
    'Scandinavian Kitchen', no placeholder ₦90k figure."
  - Contact: "Form includes name, phone, location, project type, budget, and
    routes to one of: Design / Estimate / Book Project pipelines."
  - Materials: "Category grid loads real categories (Bathroom, Kitchen,
    Tiles, Plumbing, Electrical, …) — page does not render empty."
  - Ziora: "All copy says 'Design with Ziora', not 'AI Visualizer' or 'Ask
    our AI'. Page sits below TBM's core offer in the site IA, never above."

- **Technical section**, one shared checklist reused verbatim from this
  repo's own `CLAUDE.md` Feature Checklist, applied per page: loading
  skeleton, explicit empty state, error path that never renders raw
  `error.message`, mobile card view if the page has any tabular data, 44px
  touch targets, `npm run lint:arch` and `npm run typecheck` pass, page
  actually driven in a browser (not just "the build succeeded").

Every item must be phrased so a reviewer can mark it PASS/FAIL from
observable evidence — a file, a rendered string, a screenshot description —
never from an unverifiable intent ("feels premium").

## 2. The reviewer subagent

**Definition file:** `.claude/agents/page-readiness-reviewer.md`

**Purpose:** given one page route, check it against the rubric's global
section + that page's specific section + the technical section, and return a
structured verdict. It never edits anything — read-only, so its verdict
can't be contaminated by its own fixes.

**Tools:** Read, Grep, Glob, Bash (to run the local dev server, `curl` the
route, and inspect rendered HTML/text — no code changes).

**Input contract:** a page route (e.g. `/about`) plus the current rubric
file path.

**Output contract:** structured verdict:

```
PAGE: /about
VERDICT: FAIL
FAILING ITEMS:
  [global] "TBM Digital" reference found — components/shared/footer.jsx:42
  [about]  "10,000 homes transformed" conflicts with homepage's "700+ projects"
  [technical] no loading.jsx for this route segment
NEEDS HUMAN VERIFICATION:
  [technical] page driven in a browser, signed out — requires visual/interactive judgment this agent can't perform
PASSING ITEMS: <count> of <total>
```

VERDICT is PASS only over items the agent can actually check — anything
requiring visual or interactive judgment (starting with "driven in a
browser") is never marked PASS/FAIL and never counted toward VERDICT.
Instead it's always listed under `NEEDS HUMAN VERIFICATION`, so a human
confirms it separately before a page is treated as truly done. Without this
split, the reviewer's own fail-closed rule (below) would make every page
permanently FAIL, since "driven in a browser" can never be verified by a
text-only agent — this was caught and ruled on during implementation (see
the plan's ledger).

A FAIL always names the rubric line item, the file/evidence, and enough
detail to act on without re-deriving the gap. A PASS still lists what was
checked, so a human can audit the verdict itself.

## 3. The gate loop

For each page, in order (§4):

1. Dispatch the reviewer subagent for that route.
2. If FAIL: fix every listed gap directly (following this repo's normal
   `feature`/`endpoint` conventions where the fix touches data or API
   calls), then re-dispatch the reviewer.
3. Repeat until PASS.
4. Only on PASS does work move to the next page in the order.

No page is worked on out of turn. If fixing one page's gap requires a global
component change (e.g. Footer), that change is made once and benefits every
subsequent page's pass automatically — but already-passed pages are not
retroactively re-verified unless the global change plausibly broke them.

## 4. Page order

Home (includes the global shell: Navbar, Footer, site-wide brand strings) →
About → Contact → Projects → Services → Materials/Bogat → Ziora.

Rationale: matches the audit's own emphasis — credibility risks concentrated
in Home/About/Contact/Projects are fixed first; Ziora is deliberately last
since the audit's core correction is to de-emphasize it relative to TBM's
core offer, so its content pass happens only after that hierarchy is already
established on the pages before it.

## Out of scope

- Sub-project B: the actual per-page content/data/IA remediation. Each
  page's fix is scoped and executed when that page comes up in the loop, not
  designed in advance here.
- CMS, payment gateway, mobile app, and other "Web App Correction Document"
  items that describe rebuilding this as a full transactional web app (user
  dashboards, saved designs, BOQ history). Those are a separate, larger
  initiative and are not part of the page-readiness gate.
- SEO landing pages (Priority 6 in the audit) are technical-section line
  items where they apply to an existing page, but net-new SEO landing pages
  (e.g. "Home Renovation Abuja") are new pages, not corrections to existing
  ones, and are out of scope here.
