# GPT Project Audit — driplo.bg

Generated: 2025-08-08
Owner/Branch: w3bsuki/driplo.bg @ main

Executive Summary

- Overall: Solid SvelteKit 2 + Svelte 5 foundation with good tooling (Vite 7, Vitest, Playwright, Tailwind, Sentry, Paraglide).
- Primary blockers: Supabase type drift and schema mismatches, many TypeScript errors, lingering any/as any usage, permissive CSP, and a few legacy styling/slot patterns.
- Quick wins: Regenerate Supabase types and remove duplicate DB type sources, fix env access patterns, gate console logging, migrate the single @apply, and audit the few <slot> usages if adopting the “children render” API.

Stack Snapshot

- Framework: Svelte 5.36.13, SvelteKit ^2.22.0
- Build: Vite 7, rollup visualizer, manualChunks configured
- Styling: Tailwindcss ^4.1.11 (JS config currently resembles v3 style), PostCSS
- Types: TypeScript strict, svelte-check
- Testing: Vitest, Playwright (+ axe core)
- i18n: inlang Paraglide
- Observability: Sentry SvelteKit
- Deployment: Vercel adapter (nodejs20.x)

Key Findings (evidence-based)

1. Svelte 5 migration status

- No occurrences of legacy Svelte patterns:
  - export let — 0 matches
  - on:events — 0 matches
  - $: reactive labels — 0 matches
- Residual <slot> tags: 5 matches in `+layout.svelte`, `lib/components/native/{Card,Label,Button}.svelte`, `(app)/admin/+layout.svelte`.
  - Action: Only update if you standardize on the {@render children?.()} pattern as per your refactor guide; otherwise slots are fine in Svelte 5.

2. TypeScript health

- tsc_output.txt includes extensive errors across server routes, utils, and email. Dominant themes:
  - Supabase Database types mismatch and missing tables/functions (e.g., relation "brand_profiles" not assignable, rpc name constraints, PostgREST version mismatch between two Database types).
  - Env access patterns requiring bracket notation indexing (TS4111).
  - Many narrowness/nullability issues (string | undefined/null not assignable to string), uninitialized fields, not-all-code-paths-return.
- any usage: ≥68 typed any; as any: ≥40. Concentrated in routes for brands/admin/checkout, UI error boundaries, utils (lazy-loading, swr-cache), and email server code.
  - Action: Triage by surface area: server routes (data correctness) → checkout/payment → error boundaries → misc UI.

3. Supabase types and schema drift (highest ROI to fix)

- Errors show two competing Database types:
  - import("src/lib/types/database") vs import("src/lib/types/database.types").
  - Postgrest version mismatch and missing tables/functions (brand_profiles, reviews, transactions, admin_users, custom RPCs).
- Action:
  - Pick a single canonical file: `src/lib/database.types.ts` (recommended) and delete/replace any alternative `src/lib/types/database.*` sources.
  - Regenerate types from the live project or consolidated migrations to match reality (tables + functions).
  - Update imports project-wide to the single source.

4. Logging

- ≥128 console.log matches (search capped) — many in scripts and service worker, a few in components (`DataErrorBoundary.svelte`, etc.).
- Action: Replace with a minimal logger that no-ops in prod, or guard with `if (import.meta.env.DEV)`.

5. Tailwind configuration

- Package is Tailwind v4, but `tailwind.config.js` uses v3-style JS config and plugins.
- v4 favors CSS-first @theme tokens and reduced config surface. Plugins like `@tailwindcss/forms` may differ.
- Action: Decide:
  - Option A: Migrate fully to v4 CSS-first (preferred, aligns with your refactor doc), moving tokens to `@theme` and auditing plugin compatibility.
  - Option B: Lock to Tailwind v3 if the current JS config and plugins are needed now; then plan a v4 migration later.

6. CSP/security

- Current CSP includes 'unsafe-inline' and 'unsafe-eval' in script-src; generous frame/connect lists.
- Action: Harden for production:
  - Remove 'unsafe-eval' and reduce 'unsafe-inline' via SRI or nonces.
  - Restrict connect/img/iframe origins to what is strictly needed.

7. Duplicated components

- HeroSearch: only `ModularHeroSearch.svelte` present. Others removed — good.
- TopSellers: only `SimplifiedTopSellers.svelte` present. Consolidation likely complete.

8. Styling anti-patterns

- Single `@apply` found in `lib/components/profile/SocialMediaLinks.svelte` line ~160.
- Action: Replace with utility classes or component-level CSS vars.

9. Build split and budgets

- Good manualChunks strategy for vendors/features; sourcemaps enabled.
- Action: Use generated `stats.html` (visualizer) to enforce budgets (e.g., route chunks < 150KB gzip).

10. Testing and a11y

- Vitest + Playwright present; `@axe-core/playwright` is installed — great.
- Action: Ensure smoke tests for critical flows (auth, browse, listing view, checkout) exist and run in CI.

Top 10 Priority Fixes (with references)

1. Unify and regenerate Supabase types
   - Delete/replace any `src/lib/types/database*` in favor of `src/lib/database.types.ts`.
   - Regenerate types so that tables (brand_profiles, reviews, transactions, admin_users, …) and RPCs (get_top_brands, get_user_stats, admin_verify_user_email, etc.) exist in the types.
   - This will clear the majority of "No overload matches" and rpc name constraint errors.

2. Fix env access patterns
   - Replace dot access on Vite env with bracket access (e.g., `publicEnv['VITE_PUBLIC_SENTRY_DSN']`).
   - Files implicated: `src/hooks.client.ts`, `src/hooks.server.ts`.

3. Remove/replace any conflicting Database type imports
   - Search/replace imports to use `import type { Database } from '$lib/database.types';` everywhere.

4. Triage and eliminate typed any / as any in core data paths
   - Start with server routes: `(app)/brands`, `(app)/admin`, `(app)/browse`, dashboard.
   - Then checkout/payment components and email server functions.

5. Address nullability/undefined errors systematically
   - Add guards or refine zod schemas where inputs can be undefined/null.
   - Reassess return types in utils reporting "not all code paths return".

6. Tailwind v4 decision
   - If staying v4: Move tokens to @theme and remove the remaining `@apply` usage; audit plugins for v4 compatibility.
   - If reverting to v3 for now: Pin tailwindcss to v3, ensure plugin compatibility, and schedule a v4 migration later.

7. Harden CSP
   - Remove 'unsafe-eval' (and ideally 'unsafe-inline') from script-src.
   - Minimize allowed origins.

8. Replace residual <slot> if adopting children render pattern
   - Update the 5 occurrences only if committing to the new API.

9. Logging policy
   - Introduce a tiny logger (dev-only) and remove production console.log. Keep SW logs if needed but reduce verbosity.

10. CI checks and budgets

- Enforce type checks (`svelte-check`, `tsc`), lint, unit + e2e, and bundle size thresholds in CI before merging.

Concrete Evidence Summary (search samples)

- Slots: 5 matches in `+layout.svelte`, `lib/components/native/{Card,Label,Button}.svelte`, `(app)/admin/+layout.svelte`.
- any: ~68 usages; as any: ~40.
- @apply: 1 (SocialMediaLinks.svelte).
- console.log: ≥128 matches (capped), mostly scripts and SW; a few UI components.
- tsc issues: Extensive; see `tsc_output.txt` — dominated by Supabase type drift.

Suggested Execution Plan (fast track)
Day 1–2 (Blockers)

- Supabase types: regenerate from the live project; remove duplicate Database types; unify imports.
- Fix env access TS4111 issues.
- Re-run type checks and snapshot remaining errors.

Day 3–4 (Stability)

- Eliminate any/as any in server routes and checkout/payment paths.
- Add guards for undefined/null in utils and server loaders.
- Replace the single @apply.

Day 5–6 (Security/Perf)

- Tighten CSP.
- Introduce logger wrapper and remove prod console logs.
- Generate bundle stats and set budgets.

Day 7–8 (UI/Ergonomics)

- If adopting children render API, refactor the 5 slot sites.
- Tailwind v4 decision and initial migration (or pin to v3).

Quality Gates (to add/enforce)

- Type: svelte-check + tsc must pass.
- Lint: ESLint + Prettier.
- Tests: Vitest unit + Playwright smoke; axe a11y checks on key pages.
- Perf: Bundle size treemap checked into repo; budgets enforced.
- Security: CSP audit and Sentry DSN/env correctness.

Notes on this Repo

- `svelte.config.js` uses Vercel adapter with nodejs20.x and prerender entries defined.
- `vite.config.ts` includes Paraglide, Sentry, sveltekit plugin, and stat visualizer.
- `tsconfig.json` is strict and well-configured; leverage it by resolving the Supabase type drift first.
- Only one TopSellers and one HeroSearch implementation remain — consolidation looks done.

Appendix: Files to focus first

- Env access: `src/hooks.client.ts`, `src/hooks.server.ts`.
- Supabase drift: `src/lib/types/**`, `src/lib/database.types.ts`, `src/lib/types/api.types.ts`, server routes under `(app)/brands`, `(app)/admin`, `(app)/browse`.
- High-any density: `src/lib/components/checkout/**`, `src/lib/components/error-boundaries/**`, `src/lib/components/onboarding/**`, `src/lib/server/email.ts`, `src/lib/utils/**`.
- Styling cleanup: `src/lib/components/profile/SocialMediaLinks.svelte` (@apply).
- Slots (if changing API): `src/routes/+layout.svelte`, `src/lib/components/native/{Card,Label,Button}.svelte`, `src/routes/(app)/admin/+layout.svelte`.

If you want, I can:

- Generate a PR plan of atomic commits with search-and-replace steps.
- Start by unifying Supabase types and updating the imports for you.
- Add a logger utility and replace raw console.log calls in src/.
