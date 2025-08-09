# Driplo — Production Readiness Audit (2025-08-09)

## 🚨 CRITICAL DOS AND DON'TS FOR PRODUCTION-READY REFACTORING 🚨

### ✅ SVELTE 5 BEST PRACTICES — DOS

#### State Management

- ✅ **DO** use `$state()` for reactive state instead of `let` declarations
- ✅ **DO** use `$derived()` for computed values that depend on state
- ✅ **DO** use `$effect()` sparingly and only for side effects (DOM manipulation, subscriptions)
- ✅ **DO** use `$props()` for component inputs with destructuring and default values
- ✅ **DO** use `$state.raw()` for large objects/arrays that won't be mutated
- ✅ **DO** use `$state.snapshot()` when passing state to external libraries

#### Component Architecture

- ✅ **DO** use `{#snippet}` and `{@render}` for reusable template fragments
- ✅ **DO** use classes with `$state` fields for complex stateful logic
- ✅ **DO** prefer passing state as props or using context over module-level state
- ✅ **DO** use TypeScript for type safety with `interface Props { ... }`

#### Event Handlers (CRITICAL!)

- ✅ **DO** use new Svelte 5 syntax: `onclick`, `oninput`, `onsubmit`, `onfocus`, `onblur`
- ✅ **DO** convert ALL old event handlers when editing ANY component

### ❌ SVELTE 5 ANTI-PATTERNS — DON'TS

#### State Management

- ❌ **DON'T** use reactive `let` declarations (Svelte 4 style)
- ❌ **DON'T** use `$:` reactive statements
- ❌ **DON'T** mutate props unless they are `$bindable`
- ❌ **DON'T** mutate `$state.raw()` objects — reassign them instead
- ❌ **DON'T** export reassignable state from `.svelte.js` modules
- ❌ **DON'T** destructure reactive values if you need reactivity

#### Event Handlers (BUILD BREAKER!)

- ❌ **NEVER** use `on:click`, `on:input`, `on:submit` (Svelte 4 syntax) — BUILD WILL FAIL!
- ❌ **DON'T** mix old and new event syntax in the same component
- ❌ **DON'T** use `export let` for props — use `$props()` instead

### ✅ SVELTEKIT 2 SSR BEST PRACTICES — DOS

#### Data Loading

- ✅ **DO** use server `load` functions (`+page.server.js`) for database/API calls with secrets
- ✅ **DO** use universal `load` functions (`+page.js`) for public API calls
- ✅ **DO** return promises from server `load` for streaming data
- ✅ **DO** use `depends()` and `invalidate()` for fine-grained revalidation
- ✅ **DO** use `event.fetch` in load functions for automatic request deduplication

#### Performance

- ✅ **DO** prerender static pages with `export const prerender = true`
- ✅ **DO** use `export const ssr = true` (default) for SEO and initial load performance
- ✅ **DO** implement proper `<title>` and `<meta>` tags in `<svelte:head>`
- ✅ **DO** use link preloading with appropriate strategies
- ✅ **DO** avoid waterfalls by loading data in parallel

#### Security & Hooks

- ✅ **DO** use `hooks.server.js` for authentication and request handling
- ✅ **DO** store user session in `event.locals`
- ✅ **DO** use server-only modules (`$lib/server/*` or `*.server.js`) for secrets
- ✅ **DO** validate all user inputs with proper schemas
- ✅ **DO** implement CSP headers consistently

### ❌ SVELTEKIT 2 ANTI-PATTERNS — DON'TS

#### Data Loading

- ❌ **DON'T** store shared state in module-level variables on the server
- ❌ **DON'T** have side effects in `load` functions
- ❌ **DON'T** use waterfalls — avoid sequential `await parent()` calls
- ❌ **DON'T** access `url.hash` during SSR (not available on server)
- ❌ **DON'T** forget to handle promise rejections when streaming

#### Performance

- ❌ **DON'T** disable SSR unless absolutely necessary (breaks SEO)
- ❌ **DON'T** prerender pages with dynamic content or form actions
- ❌ **DON'T** load all data sequentially — parallelize with `Promise.all()`
- ❌ **DON'T** import heavy libraries in universal code if only needed client-side

### ✅ SUPABASE PRODUCTION BEST PRACTICES — DOS

#### Authentication & SSR

- ✅ **DO** use `@supabase/ssr` for cookie-based auth in SvelteKit
- ✅ **DO** create server-side Supabase client in `hooks.server.js`
- ✅ **DO** validate JWT tokens with `safeGetSession()`
- ✅ **DO** store session in `event.locals` for request-scoped access
- ✅ **DO** use RLS (Row Level Security) policies for all tables

#### Database & Performance

- ✅ **DO** create indexes on frequently queried columns
- ✅ **DO** use connection pooling for serverless environments
- ✅ **DO** implement proper error handling for all database operations
- ✅ **DO** use transactions for multi-step operations
- ✅ **DO** batch operations when possible

#### Security

- ✅ **DO** enable RLS on all tables without exception
- ✅ **DO** use service role key only in server-side code
- ✅ **DO** validate all inputs before database operations
- ✅ **DO** use prepared statements to prevent SQL injection
- ✅ **DO** implement rate limiting for API endpoints

### ❌ SUPABASE ANTI-PATTERNS — DON'TS

#### Authentication

- ❌ **DON'T** use client-side auth methods in SSR context
- ❌ **DON'T** store auth tokens in localStorage for SSR apps
- ❌ **DON'T** expose service role key to client
- ❌ **DON'T** skip JWT validation in server hooks

#### Database

- ❌ **DON'T** disable RLS "for testing" and forget to re-enable
- ❌ **DON'T** use `anon` key for operations requiring elevated privileges
- ❌ **DON'T** make unnecessary database calls — cache when appropriate
- ❌ **DON'T** ignore database connection limits

### 🎯 IMMEDIATE REFACTORING PRIORITIES

1. **Event Handler Migration** — Convert ALL `on:` to new syntax
2. **State Management** — Replace `let` with `$state()`, `$:` with `$derived()`
3. **Props Migration** — Convert `export let` to `$props()`
4. **SSR Optimization** — Ensure proper server/universal load split
5. **RLS Implementation** — Enable on all Supabase tables
6. **Cookie Auth** — Implement proper SSR auth flow
7. **Error Boundaries** — Add proper error handling
8. **Type Safety** — Replace all `any` types

---

This document inventories the project, catalogs duplicates/bloat, flags bad practices and hardcoded values, highlights monolithic components that should be modularized, and proposes concrete, high‑impact fixes to ship a clean, stable production build tomorrow.

---

## 1) Executive summary

- Status: mostly production-ready; several high-priority cleanups required (CSP consistency, domain hardcodes, CORS env‑gating, stray files, backup file removal, type any/`as any` patches, TODO email flows).
- Biggest risks:
  - Mixed domain hardcodes (driplo.com vs driplo.bg) in emails/SEO and Supabase templates cause redirect/login/email issues.
  - CSP mismatch between `svelte.config.js` and `vercel.json` (unsafe-eval present in Vercel headers) could reduce security.
  - CORS allowlist hardcoded with localhost; should be environment‑based for production.
  - Stray/garbled file at repo root: `Kdriplo-blue-mainsrclibutilsresponsive-image.ts`.
  - Backup component present: `ProfileSetupWizard.svelte.backup`.
  - Excessive use of `any` and `as any` across routes and server code.
  - Several long/monolithic Svelte pages suitable for extraction into smaller components and/or shadcn/bits-ui primitives.
  - Local console logging left in UI (`WelcomeModal.svelte`).

---

## 2) Project map

Top-level directories:

- .claude/, \_claude/ (automation docs and checklists)
- .github/ (release checklist)
- .storybook/ (storybook scaffolding)
- .svelte-kit/, .vercel/ (build artifacts)
- docs/ (refactor and performance reports)
- messages/ (i18n messages — separate from Paraglide)
- project.inlang/ (Paraglide config)
- scripts/ (DX utilities)
- src/ (app code)
- static/ (public assets)
- supabase/ (config, migrations)
- tests/, test-results/, playwright-report/ (e2e/tests/artifacts)

Key src structure:

- src/app.html, app.css, hooks.\*
- src/lib
  - components/ (feature folders; uses bits-ui + bespoke)
  - config/
  - contexts/, actions/, stores/
  - server/ (APIs, emails, utils)
  - utils/ (many helpers; includes imaging, caching, perf)
  - paraglide/ (generated i18n)
- src/routes
  - (app)/, (auth)/, (category)/, api/, auth/, brands/, dashboard/, login/, logout/, privacy/, register/

Components inventory (folders under `src/lib/components/`):

- auth, badges, brands, browse, category, checkout, common, conversion, cookie-consent, error-boundaries, forms, gallery, home, layout, listings, messaging, native, navigation, notifications, onboarding, orders, payment, profile, search, seller, seo, shared, skeletons, subcategory, ui, upload, WelcomeModal.svelte

---

## 3) Database schema (overview)

Tables and RPC found in `src/lib/database.types.ts` (generated from Supabase):

- Tables: admin_audit_log, auth_events, auth_rate_limits, auth_sessions, brand_profiles, brands, cart_items, categories, conversations, coupon_usage, coupons, disputes, documents, favorites, listing_drafts, listing_views, listings, messages, notifications, orders, payment_accounts, payment_methods, profiles, refund_requests, shopping_carts, social_media_accounts, user_achievements, user_follows, user_notifications, user_ratings, user_stats_summary, web_vitals
- RPC/Functions (partial): calculate_profile_completion, check_auth_rate_limit, cleanup_auth_rate_limit, cleanup_expired_data, complete_user_onboarding, create_order_with_payment, debug_listing_insert, generate_order_number, get_auth_uid, get_brand_statistics, get_or_create_conversation, get_recommended_listings, get_seller_analytics, get_seller_stats, get_top_sellers, get_user_onboarding_status, get_user_stats, log_auth_event, make_user_admin, reset_user_onboarding, track_listing_view, update_onboarding_step, update_user_stats, user_needs_onboarding, validate_coupon_code

---

## 4) Duplicates, backups, bloat, and stray files

Confirmed issues:

- Backup file present: `src/lib/components/onboarding/ProfileSetupWizard.svelte.backup` — should be deleted or moved out of src.
- Stray/garbled path at repo root: `Kdriplo-blue-mainsrclibutilsresponsive-image.ts` — breaks tooling; delete.
- Multiple imaging utilities (potential overlap):
  - `src/lib/utils/supabase-image-transform.ts` (render endpoint)
  - `src/lib/utils/supabase-images.ts` (aux helpers)
  - `src/lib/utils/responsive-image.ts` (client resolver)
    Action: consolidate into a single imaging surface API and delete redundant ones; keep server vs client separation only if justified.
- Homegrown cache layer `swr-cache.ts` while TanStack Query is installed — likely duplication of concerns. Action: deprecate `swr-cache` in favor of TanStack for client fetching; keep a minimal SSR cache header helper.
- Performance util megafile: `src/lib/utils/performance.ts` (15.8 KB) — contains many utilities, some unused; prune and split by use (throttle/debounce in small module; advanced helpers removed or lazy‑loaded).
- Playwright static report committed: `playwright-report/` — treat as build artifact; exclude from Git and CI cache (keep locally or publish artifact).
- Docs indicate previous duplicate types and components were removed; re‑verify types barrel exports to avoid re‑introducing duplicate symbols.

Large/monolithic components (top examples by size):

- pages: `(app)/leaderboard/+page.svelte`, `(app)/wishlist/+page.svelte`, `(app)/orders/+page.svelte`, `register/+page.svelte`, `(app)/brands/analytics/+page.svelte`, `(app)/brands/[slug]/+page.svelte`, `(app)/profile/[username]/+page.svelte`
- components: `messaging/MessageThread.svelte`, `orders/OrderList.svelte`, `onboarding/ProfileSetupWizard.svelte`, `category/CategoryLanding.svelte`, `shared/FilterSection.svelte`, `orders/OrderDetails.svelte`, `layout/MobileFiltersDrawer.svelte`, `navigation/MobileCategoryMenu.svelte`
  Action: extract UI primitives (list items, headers, forms, sections) into reusable `lib/components/ui` atoms/molecules; prefer bits‑ui/shadcn‑style composition.

---

## 5) Hardcoded and environment‑specific values

Domain mismatches and hardcodes:

- Mixed domains: `driplo.bg` (docs/templates/Supabase) vs `driplo.com` (emails/SEO/components). Examples:
  - `src/lib/server/email.ts`: from `Driplo <noreply@driplo.com>`; links use `https://driplo.com/...` and `support@driplo.com`.
  - `src/lib/components/seo/CategorySEO.svelte`: `const baseUrl = 'https://driplo.com'`.
  - Supabase email template guide (`SUPABASE_EMAIL_SETUP.md`) targets `https://driplo.bg`.
    Action: centralize `PUBLIC_APP_URL` and `PUBLIC_SUPPORT_EMAIL` envs; replace hardcodes; choose canonical domain (likely driplo.bg) for all links and emails.

CORS / Allowed origins hardcoded:

- `src/lib/server/api-utils.ts` has arrays with `https://driplo.bg`, `https://www.driplo.bg` and localhost ports. Action: derive from env (`PROD_ORIGIN`, `STAGING_ORIGIN`, `LOCAL_ORIGINS`) and gate by `NODE_ENV`.

Social links hardcoded:

- `MobileCategoryMenu.svelte` links to Instagram/TikTok profiles. Action: put in config and inject.

Misc hardcodes:

- Privacy page email `privacy@driplo.com` — centralize email addresses.
- SMTP/Supabase settings are documented but ensure runtime uses env instead of literals.

---

## 6) Security, CSP, and headers

- CSP mismatch:
  - `svelte.config.js` removed `unsafe-eval` in `csp.directives` (good).
  - `vercel.json` CSP header includes `'unsafe-eval'` in `script-src` (bad). Action: remove `'unsafe-eval'` from Vercel CSP to match SvelteKit.
- Consider replacing `'unsafe-inline'` for styles with nonces/hashes (future hardening).
- HSTS present; good. Permissions‑Policy minimal; good.

---

## 7) Logging and debug code

- Dev logger correctly gates console in `logger.ts`. But direct `console.log` calls in UI remain (e.g., `WelcomeModal.svelte`). Action: replace with `logger.*` or remove.
- `scripts/copy-fonts.js` prints to console; acceptable for build log.

---

## 8) Type safety — `any` and `as any`

Representative occurrences (not exhaustive):

- Admin/brand pages and APIs: frequent `as any` when DB types missing (e.g., `brand_verification_requests`, `admin_approvals`).
- Onboarding server/page and Svelte components use `any` for form data and social media accounts.
- Utility caches, data-fetcher, tests use `any`.
  Action:
- Regenerate Supabase types; add missing tables; remove `as any` casts.
- Tighten route action payloads with Zod schemas.

---

## 9) Over‑engineering vs under‑engineering

Over:

- Custom SWR cache alongside TanStack Query — maintain one. Prefer TanStack.
- Very large performance util collection; keep only used, move advanced helpers behind lazy imports.

Under:

- Multiple TODOs for sending emails on order lifecycle (ship/complete/cancel) — implement using `EmailService`.
- `onboarding` store/server has TODOs to integrate proper Supabase client from page data.
- Payment manual flow comments indicate placeholders — confirm final provider strategy.

---

## 10) Build, assets, and performance

- Fonts copied to `static/fonts` via script; works. Option: use `@fontsource` CSS imports only and drop copying to slim repo; or keep for self‑hosting consistency.
- Vite config uses manualChunks for strong code splitting; good. Sourcemaps enabled for Sentry; ensure Sentry env vars set in prod.
- Large generated Paraglide assets are expected; ensure they’re excluded from lint.

---

## 11) Testing and CI

- E2E and accessibility tests present. Ensure Playwright artifacts are not committed to Git; add `playwright-report/` to .gitignore.
- Run `npm run test:e2e` and `npm run lighthouse:mobile` before deploy.

---

## 12) Concrete remediation plan (tomorrow readiness)

High priority (mandatory):

1. Domains and emails
   - Introduce envs: `PUBLIC_APP_URL`, `PUBLIC_SUPPORT_EMAIL`, `PUBLIC_SOCIAL_INSTAGRAM`, `PUBLIC_SOCIAL_TIKTOK`.
   - Replace all `driplo.com` literals with `${PUBLIC_APP_URL}` links and support email env.
   - Align Supabase templates to `PUBLIC_APP_URL`.
2. CSP
   - Remove `'unsafe-eval'` from `vercel.json` CSP to match SvelteKit CSP.
3. CORS
   - Move allowed origins in `api-utils.ts` to env‑driven list; switch by `NODE_ENV`.
4. Stray/backup files
   - Delete `Kdriplo-blue-mainsrclibutilsresponsive-image.ts`.
   - Delete `ProfileSetupWizard.svelte.backup` (validate current wizard fixed unique step ids).
5. Logging
   - Remove direct `console.log` in `WelcomeModal.svelte` and any others; use `logger`.

Medium priority (strongly recommended): 6) Imaging utils

- Consolidate `supabase-image-transform.ts`, `supabase-images.ts`, and `responsive-image.ts` into a minimal server/client pair; update imports.

7. Type safety
   - Regenerate Supabase types; add missing tables; eradicate `as any` casts in admin/brand routes.
8. Monolith components
   - Extract sections from the largest pages into smaller components; reuse bits-ui/shadcn style primitives for forms, lists, sheets, drawers.
9. SWR duplication
   - Migrate client data layers to TanStack Query; deprecate `swr-cache.ts`.

Nice to have (post‑launch): 10) CSP nonces for styles; drop `'unsafe-inline'`. 11) Replace hardcoded social links with CMS/config. 12) Remove `playwright-report/` from repo and CI cache; publish as artifact only.

---

## 13) File‑by‑file notable findings (selected)

- `src/lib/server/email.ts`
  - Hardcoded `from` and links to `driplo.com` and `support@driplo.com`.
  - Action: parameterize base URL and support email via env; ensure `.bg` if that is canonical.
- `src/lib/components/seo/CategorySEO.svelte`
  - `baseUrl` hardcoded to `https://driplo.com`.
- `src/lib/server/api-utils.ts`
  - Hardcoded allowed origins incl. localhost; gate by env.
- `src/lib/components/navigation/MobileCategoryMenu.svelte`
  - Instagram/TikTok links hardcoded; move to env/config, and verify domain.
- `src/lib/components/onboarding/ProfileSetupWizard.svelte.backup`
  - Backup artifact; delete.
- `src/lib/utils/performance.ts`
  - Many utilities; keep only used exports and split.
- `src/lib/utils/swr-cache.ts`
  - Overlaps with TanStack Query; plan migration.
- `src/lib/paraglide/*`
  - Generated; exclude from lint; large bundle cost acceptable.
- `vercel.json`
  - CSP includes `'unsafe-eval'` — remove.
- `svelte.config.js`
  - CSP improved; ensure alignment with platform headers.

---

## 14) Checklist to execute

- [ ] Set envs: `PUBLIC_APP_URL`, `PUBLIC_SUPPORT_EMAIL`, `ALLOWED_ORIGINS`, Sentry vars.
- [ ] Replace all `driplo.com`/`driplo.bg` literals with envs across code and email templates.
- [ ] Update Supabase Email templates: use `${PUBLIC_APP_URL}/auth/confirm` etc.
- [ ] Fix Vercel CSP to remove `'unsafe-eval'`.
- [ ] Env‑gate CORS in `api-utils.ts`.
- [ ] Remove stray file and backup wizard.
- [ ] Remove console logs in UI.
- [ ] Regenerate Supabase types; eliminate `as any`.
- [ ] Decide imaging util consolidation; refactor call sites.
- [ ] Extract large components into subcomponents; keep UI the same.
- [ ] Exclude `playwright-report/` from Git; ensure tests pass.

---

## 15) References to prior internal audits (for traceability)

- COMPREHENSIVE_AUDIT_REPORT_2025.md — duplicate checkout logic, legacy types
- COMPREHENSIVE_TECHNICAL_DEBT_ANALYSIS.md — duplicate types/components (Category, CreateListingForm)
- CODEBASE_CLEANUP_REPORT.md — duplicate component removals
- REFACTOR\_\* docs — consolidation logs; utils/component dedupe already done
- DATABASE_PERFORMANCE_OPTIMIZATION_REPORT.md — query deduplication highlights

This document should be kept in sync as the above fixes land.

---

## 16) Opus 4.1 Comprehensive Audit (2025-08-09)

### Critical Issues Found

#### 🚨 HIGH PRIORITY - Security & Production Readiness

1. **Supabase RLS Policy Gaps**
   - Tables with RLS enabled but NO policies: `admin_audit_log`, `coupons`, `disputes`, `refund_requests`
   - **Impact**: Data exposed without proper access control
   - **Fix**: Implement RLS policies immediately for these tables

2. **Function Security - Search Path Mutable**
   - Functions with mutable search_path: `update_updated_at`, `update_seller_stats`, `set_order_number`, `update_listing_like_count`
   - **Impact**: Potential SQL injection vulnerability
   - **Fix**: Set explicit search_path in all functions

3. **Auth Security Weaknesses**
   - OTP expiry set to >1 hour (should be <1 hour)
   - Leaked password protection disabled
   - **Fix**: Enable leaked password protection via HaveIBeenPwned, reduce OTP expiry

4. **Stray File in Repository Root**
   - File exists: `K:driplo-blue-mainsrclibutilsresponsive-image.ts` (garbled path)
   - **Impact**: Breaks tooling, confuses build systems
   - **Fix**: Delete immediately

#### ⚠️ MEDIUM PRIORITY - Code Quality & Maintainability

5. **TypeScript Errors in Production Code**
   - `/onboarding/+page.svelte`: Multiple `logger` not found errors, unused variables, type mismatches
   - Deprecated `page` store usage
   - Non-reactive state updates (`supabase` not declared with `$state()`)
   - **Fix**: Import logger properly, fix type issues, update to new Svelte 5 patterns

6. **Console Logging in Production**
   - Direct `console.log` found in `WelcomeModal.svelte`
   - **Fix**: Replace with logger utility or remove

7. **Legacy Svelte Event Syntax**
   - Found `on:click` in `LandingCategories.svelte` (should be `onclick`)
   - **Impact**: Build failures in Svelte 5
   - **Fix**: Update all event handlers to new syntax

8. **Type Safety Issues**
   - 36+ occurrences of `any` type across TypeScript files
   - Heavy use of `as any` casts in admin/brand routes
   - **Fix**: Add proper types, regenerate Supabase types

#### 📊 Performance & Architecture Issues

9. **Large Migration Count**
   - 63 migrations detected - indicates schema evolution chaos
   - Multiple "fix" migrations suggest reactive rather than planned development
   - **Recommendation**: Consolidate migrations for production

10. **Monolithic Components**
    - Large page components that should be broken down:
      - `ProfileSetupWizard.svelte`
      - `CategoryLanding.svelte`
      - `MessageThread.svelte`
      - `OrderList.svelte`
    - **Fix**: Extract into smaller, reusable components

11. **Duplicate Utilities**
    - Multiple image transformation utilities with overlapping functionality
    - SWR cache alongside TanStack Query
    - **Fix**: Consolidate to single implementation

12. **Performance Utils Bloat**
    - `performance.ts` is 15.8KB with many unused utilities
    - **Fix**: Tree-shake and split into focused modules

#### 📝 Documentation & Process Issues

13. **TODO Comments Throughout**
    - 39 TODO/FIXME comments found
    - Critical missing features: email notifications for order lifecycle
    - **Fix**: Address all TODOs before production

14. **Mixed Domain References**
    - Inconsistent use of `driplo.com` vs `driplo.bg`
    - Already noted in previous audit but still present
    - **Fix**: Standardize to single domain

### Svelte 5 & SvelteKit Best Practices Violations

1. **Not Using Runes Properly**
   - Still using stores in some places instead of `$state`
   - Missing `$derived` for computed values
   - Not leveraging `$effect` for side effects

2. **Component Patterns**
   - Not using snippets for reusable template fragments
   - Missing proper TypeScript props with `$props()`
   - Not utilizing `$bindable` for two-way binding where appropriate

3. **Performance Optimizations Missing**
   - No use of `{#key}` blocks for proper re-rendering control
   - Missing lazy loading for heavy components
   - No code splitting strategy evident

4. **Form Handling**
   - Not leveraging SvelteKit's form actions properly
   - Missing progressive enhancement
   - No optimistic UI updates

### Database & Backend Issues

1. **Missing Indexes for Performance**
   - Many queries likely unoptimized based on migration history
   - Multiple "optimize indexes" migrations suggest ongoing issues

2. **RPC Functions Security**
   - Multiple RPC functions without proper parameter validation
   - Search path issues as noted above

3. **Storage Buckets**
   - No clear strategy for image optimization
   - Missing CDN configuration

### Production Readiness Score: 65/100

**Breakdown:**

- Security: 6/10 (RLS gaps, function vulnerabilities)
- Performance: 7/10 (decent but needs optimization)
- Code Quality: 6/10 (TypeScript issues, monolithic components)
- Maintainability: 6/10 (TODOs, duplicate code)
- Best Practices: 7/10 (mostly following Svelte 5 patterns)

### Immediate Action Items for Production

1. **TODAY (Critical)**
   - [ ] Fix RLS policies for the 4 unprotected tables
   - [ ] Set search_path in all functions
   - [ ] Enable leaked password protection
   - [ ] Delete stray file `K:driplo-blue-mainsrclibutilsresponsive-image.ts`
   - [ ] Fix TypeScript errors in onboarding page

2. **THIS WEEK (High Priority)**
   - [ ] Update all event handlers to Svelte 5 syntax
   - [ ] Remove all `any` types
   - [ ] Implement missing email notifications
   - [ ] Standardize domain references
   - [ ] Remove console.log statements

3. **BEFORE LAUNCH (Medium Priority)**
   - [ ] Break down monolithic components
   - [ ] Consolidate duplicate utilities
   - [ ] Address all TODO comments
   - [ ] Optimize database indexes
   - [ ] Implement proper error boundaries

### Comparison with Industry Standards

**Against Svelte 5 Documentation:**

- ❌ Not fully utilizing new runes system
- ❌ Legacy patterns still present
- ✅ Using new event syntax (mostly)
- ✅ TypeScript integration (needs improvement)

**Against SvelteKit Best Practices:**

- ✅ File-based routing properly implemented
- ✅ Server-side rendering utilized
- ❌ Form actions underutilized
- ❌ Missing proper error handling
- ✅ Environment variables properly used (mostly)

**Against Modern Web Standards:**

- ✅ Responsive design implemented
- ❌ Accessibility features incomplete
- ✅ Performance budgets in place
- ❌ Security headers incomplete (CSP issues)
- ✅ Progressive enhancement attempted

### Recommendation

**DO NOT SHIP TO PRODUCTION** without addressing at least the critical security issues. The codebase shows signs of rapid development with technical debt accumulation. A focused 2-3 day sprint addressing critical issues would bring this to production-ready state.

**Estimated Time to Production-Ready:**

- Critical fixes: 1 day
- High priority fixes: 2-3 days
- Full cleanup: 1 week

### Positive Aspects

1. **Good Architecture Foundation**
   - Clear separation of concerns
   - Proper use of SvelteKit features
   - Decent component organization

2. **Modern Stack**
   - Svelte 5 + SvelteKit (latest)
   - TypeScript throughout
   - Supabase for backend

3. **Performance Considerations**
   - Code splitting configured
   - Image optimization attempted
   - Caching strategies in place

4. **Developer Experience**
   - Good tooling setup
   - Linting and formatting configured
   - Testing infrastructure present

The codebase has good bones but needs cleanup before production deployment.

---

## 17) CLAUDE: Opus 4.1 Refactoring Strategy & Execution Plan

### 🎯 CLAUDE: My Approach to This Refactoring

After analyzing your codebase thoroughly, I've identified that we need a systematic, priority-driven approach. We'll tackle this in waves, ensuring each change is tested and doesn't break existing functionality.

### 📋 Refactoring Phases (We'll Execute Together)

#### **PHASE 1: Critical Security & Stability (Day 1)**

_Goal: Make the app secure and stable_

1. **Database Security Lockdown**

   ```sql
   -- I'll write proper RLS policies for:
   -- admin_audit_log, coupons, disputes, refund_requests
   ```

   - Create restrictive policies first
   - Test each policy with different user roles
   - Document access patterns

2. **Function Security Fixes**

   ```sql
   -- Add to all functions:
   SET search_path = public, extensions;
   ```

   - Update all 4 vulnerable functions
   - Test RPC calls still work
   - Verify no regression

3. **Auth Hardening**
   - Enable HaveIBeenPwned protection
   - Set OTP expiry to 30 minutes
   - Add rate limiting rules

4. **Clean Repository**
   - Delete `K:driplo-blue-mainsrclibutilsresponsive-image.ts`
   - Remove `.backup` files
   - Clean up `playwright-report/`

#### **PHASE 2: TypeScript & Svelte 5 Compliance (Day 2)**

_Goal: Zero TypeScript errors, modern Svelte patterns_

1. **Fix All Type Errors**
   - Start with `/onboarding/+page.svelte`
   - Replace all `any` with proper types
   - Generate fresh Supabase types
   - Add missing type imports

2. **Svelte 5 Migration**

   ```svelte
   <!-- OLD -->
   <button on:click={handler}>

   <!-- NEW -->
   <button onclick={handler}>
   ```

   - Systematic find & replace
   - Update state management to runes
   - Fix deprecated patterns

3. **Component Modernization**
   ```typescript
   // Convert to new patterns
   let { prop1, prop2 } = $props<Props>();
   let state = $state(initialValue);
   let computed = $derived(state * 2);
   ```

#### **PHASE 3: Code Quality & Performance (Day 3-4)**

_Goal: Clean, maintainable, performant code_

1. **Component Refactoring**
   - Break down monolithic components
   - Extract reusable UI primitives
   - Implement proper composition

2. **Utility Consolidation**

   ```typescript
   // Before: 3 image utils
   // After: 1 unified image service
   export class ImageService {
   	transform() {}
   	optimize() {}
   	responsive() {}
   }
   ```

3. **Performance Optimization**
   - Implement lazy loading
   - Add proper code splitting
   - Optimize bundle size
   - Add resource hints

4. **Remove Debug Code**
   - Replace console.log with logger
   - Remove commented code
   - Clean up TODOs

#### **PHASE 4: Domain & Infrastructure (Day 5)**

_Goal: Production-ready configuration_

1. **Environment Standardization**

   ```env
   PUBLIC_APP_URL=https://driplo.bg
   PUBLIC_SUPPORT_EMAIL=support@driplo.bg
   PUBLIC_ALLOWED_ORIGINS=https://driplo.bg,https://www.driplo.bg
   ```

2. **Email System**
   - Implement missing order notifications
   - Fix email templates
   - Test email flows

3. **Error Handling**
   - Add error boundaries
   - Implement fallback UI
   - Add Sentry integration

4. **Testing & Validation**
   - Run full E2E suite
   - Performance testing
   - Security scanning
   - Accessibility audit

### 🔄 My Iterative Process

For each phase, I'll follow this cycle:

1. **Analyze** → Understand current state
2. **Plan** → Create specific changes
3. **Execute** → Make changes incrementally
4. **Test** → Verify nothing breaks
5. **Document** → Update this file with progress
6. **Commit** → Git commit with clear message

### 📊 Progress Tracking

I'll maintain a live status here:

#### Current Status: READY TO START

- [ ] **Phase 1**: Critical Security ⏳ Not Started
  - [ ] RLS Policies
  - [ ] Function Security
  - [ ] Auth Hardening
  - [ ] Repository Cleanup

- [ ] **Phase 2**: TypeScript & Svelte 5 ⏳ Not Started
  - [ ] TypeScript Errors
  - [ ] Event Handler Syntax
  - [ ] Runes Migration
  - [ ] Props Modernization

- [ ] **Phase 3**: Code Quality ⏳ Not Started
  - [ ] Component Refactoring
  - [ ] Utility Consolidation
  - [ ] Performance Optimization
  - [ ] Debug Code Removal

- [ ] **Phase 4**: Production Config ⏳ Not Started
  - [ ] Environment Variables
  - [ ] Email Implementation
  - [ ] Error Handling
  - [ ] Final Testing

### 💡 My Recommendations

1. **Don't Skip Phases** - Each builds on the previous
2. **Test After Each Change** - Catch issues early
3. **Commit Frequently** - Easy rollback if needed
4. **Run Locally First** - Test before deploying

### 🚀 Let's Start

I'm ready to begin with **Phase 1: Critical Security**. Here's what I'll do first:

1. Fix the RLS policies for the 4 unprotected tables
2. Add search_path to vulnerable functions
3. Configure auth security settings
4. Clean up the repository

**Shall we begin with Phase 1?** I'll create the RLS policies first, test them, then move through each security fix systematically. Each change will be small, tested, and committed separately for safety.

### 📝 Notes for Our Collaboration

- I'll ask for confirmation before major changes
- I'll explain what each fix does and why
- I'll test everything locally first
- I'll keep this document updated with real-time progress
- If something breaks, we'll roll back and try a different approach

### 🎯 Success Criteria

We'll know we're done when:

- ✅ No security warnings from Supabase advisors
- ✅ Zero TypeScript errors
- ✅ All Svelte 5 patterns implemented
- ✅ Clean, modular component structure
- ✅ All tests passing
- ✅ Lighthouse scores >90
- ✅ No console errors in production
- ✅ Consistent domain usage
- ✅ All TODOs addressed

### 🔥 My Commitment

I'll work through this systematically, ensuring each change improves the codebase without breaking functionality. We'll have a production-ready application that follows best practices and is maintainable for the long term.

---

## 18) Delta audit after Supabase hardening (2025-08-09 PM) + hard cleanup plan

Update summary

- Supabase: RLS now enabled broadly and policies added for previously unprotected tables (admin_audit_log, coupons, disputes, refund_requests) in `supabase/migrations_consolidated/002_rls_policies.sql` and fresh schema in `supabase/migrations/20250109_fresh_optimized_schema.sql`.
- Function security: Key triggers/functions now use `SECURITY DEFINER SET search_path = public` (e.g., `update_updated_at`, `update_seller_stats`). Verify remaining functions (`set_order_number`, `update_listing_like_count`) are covered in the live DB.
- Auth: OTP expiry set to 1800s (30 min) in `supabase/config.toml`. Action left: enable leaked password protection (HIBP) in Supabase Auth settings.
- Remaining critical gap: Vercel CSP still includes `'unsafe-eval'` in `vercel.json`. Remove to match SvelteKit CSP.

Open items still required (highest value first)

1. Security/config

- Remove `'unsafe-eval'` from `vercel.json` CSP header (script-src).
- Env‑gate CORS in `src/lib/server/api-utils.ts` (use PROD/STAGING/LOCAL envs, no literals).
- Standardize domains (`PUBLIC_APP_URL`, `PUBLIC_SUPPORT_EMAIL`, social URLs) and replace hardcodes.
- Enable HIBP leaked password checks in Supabase (Dashboard → Authentication → Passwords).

2. Type safety & Svelte 5

- Regenerate Supabase types and remove `as any` in admin/brand/onboarding routes.
- Complete Svelte 5 event/runes migration on lingering files (legacy `on:*` handlers, non‑reactive state).

3. Utilities & component modularization

- Consolidate image utils into one surface (server transform + client responsive helper).
- Deprecate `swr-cache.ts` in favor of TanStack Query.
- Break down the largest pages/components into smaller units.

Hard removals and archival (delete/move now)

Delete (repo bloat/build artifacts/temp)

- Root:
  - `dev_server.log`
  - `eslint_output.txt`, `tsc_output.txt`
  - `playwright-report/` (committed artifact)
  - `test-results/` contents except configs (keep only CI artifacts out of VCS)
  - Garbled path file: `Kdriplo-blue-mainsrclibutilsresponsive-image.ts` (if present)
  - Backup: `src/lib/components/onboarding/ProfileSetupWizard.svelte.backup`
- Scripts (one‑off refactor helpers; remove after migration):
  - `scripts/analyze-typescript-errors.js`
  - `scripts/fix-event-handlers.js`
  - `scripts/fix-unused-imports.js`
  - `scripts/standardize-directories.js`
  - `scripts/standardize-event-handlers.js`
  - `scripts/standardize-naming.js`

Archive to `docs/archive/2025-08/` (keep history without polluting root)

- `CLAUDE.md`, `claude_work.md`
- `COMPREHENSIVE_AUDIT_REPORT_2025.md`
- `COMPREHENSIVE_TECHNICAL_DEBT_ANALYSIS.md`
- `CODEBASE_CLEANUP_REPORT.md`
- `DATABASE_OPTIMIZATION_REPORT.md`
- `DATABASE_PERFORMANCE_OPTIMIZATION_REPORT.md`
- `EGRESS_OPTIMIZATION_GUIDE.md`
- `EXECUTION_STATUS_REPORT.md`
- `gpt_audit.md`, `gpt_audit2.md`, `gpt_audit3.md`
- `gpt_fix.md`, `gpt_fixerrors.md`
- `gpt_onboarding.md`
- `gpt_ui_ux_refactor_plan.md`
- `LIKE_FEATURE_UPDATE.md`
- `LISTINGS_SYSTEM_PRODUCTION_ANALYSIS.md`
- `PRODUCTION_READINESS_REPORT.md`
- `REFACTOR_EXECUTION_REPORT.md`, `REFACTOR_MASTER_PLAN.md`, `REFACTOR_MASTER.md`

Keep at root (single source of truth)

- `README.md` (trimmed), `LICENSE`
- `gpt_production_ready.md` (this file)
- `MIGRATION_GUIDE.md`, `FRESH_DB_SETUP.md`, `SUPABASE_EMAIL_SETUP.md`
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md`

Optional cleanup decisions

- Fonts pipeline:
  - Option A: Keep `scripts/copy-fonts.js` + self‑hosted fonts in `static/fonts`.
  - Option B (simpler): Remove copy script, rely solely on `@fontsource/*` imports and purge `static/fonts` if unused. If choosing B, update `package.json` to drop `postinstall` and build font copy step.
- Supabase migrations:
  - Choose one canonical directory. Recommend `supabase/migrations/` as source of truth; archive `migrations_consolidated/` after verifying parity via diff.

.gitignore additions (to prevent re‑introduction)

- `playwright-report/`
- `test-results/`
- `*.log`
- `supabase/extracted_schema.sql`
- Local caches: `.svelte-kit/`, `.vercel/`, `project.inlang/cache/`

Refactor plan v2 (3 focused days)

Day 1 – Security/config + deletion sweep

- Apply CSP fix in `vercel.json`; redeploy preview; verify no eval errors.
- Implement env‑driven CORS in `api-utils.ts` with `PUBLIC_APP_URL`, `ALLOWED_ORIGINS`.
- Standardize domains/emails/socials; replace literals.
- Execute hard deletions; move archives; add .gitignore entries.
- Verify Supabase Auth HIBP setting.

Day 2 – Type safety + Svelte 5 compliance

- Regenerate Supabase types and remove `as any` casts in admin/brands/onboarding flows.
- Finish event handler/runes migration; fix non‑reactive state and `$page` deprecations.
- Replace stray `console.log` with `logger`.

Day 3 – Utilities consolidation + component splits

- Image utilities: collapse to `lib/utils/image/server.ts` + `lib/utils/image/client.ts`; remove deprecated modules; update imports.
- Deprecate `swr-cache.ts`; migrate client fetchers to TanStack Query.
- Extract subsections from: `ProfileSetupWizard`, `CategoryLanding`, `MessageThread`, `OrderList` into `lib/components/ui/*` primitives and feature atoms.

Validation checklist (must pass before ship)

- [ ] No `'unsafe-eval'` in production CSP headers
- [ ] CORS/redirects derive from env; no domain literals remain
- [ ] No committed artifacts (`playwright-report/`, logs, caches)
- [ ] Supabase Advisors: zero critical warnings; RLS verified with tests
- [ ] TypeScript: 0 errors; no `any`/`as any` in app/server code
- [ ] E2E + Lighthouse mobile pass thresholds

Notes on Supabase delta

- Verified RLS and function hardening in migrations; ensure the remote project is migrated to the same state and not drifting from repo. Run `supabase db diff` against prod for final parity check before launch.
- OTP expiry set to 30m is acceptable; consider 10–15m for higher security if UX allows.

Owner sign‑off

- Once the above checklist is fully green, tag the commit as `prod-ready-2025-08-09` and proceed with production deploy.

---

## 19) Refactor iteration tips (next sprint)

Practical, low‑risk guidance to accelerate the next iteration without regressions.

### Sequencing & scope

- Prefer vertical slices: 1 PR = 1 user‑visible outcome. Avoid mixing DB + UI in the same PR.
- Keep PRs small (< ~400 LOC diff) with clear commit messages and a short test plan in the description.
- Use feature flags/toggles for risky changes. Land toggled‑off, enable after validation.
- Maintain a running CHANGELOG and link PRs to checklist items in this doc.

### Svelte 5 migration guardrails

- Systematically replace: `export let` → `$props()`, reactive `let` → `$state()`, computed → `$derived()`, side effects → `$effect()`.
- Sweep for anti‑patterns: `grep -R "on:"`, `grep -R "\$:"` and fix all occurrences.
- Avoid destructuring reactive state unless using `$state.snapshot()` for a stable copy.
- Use `{#snippet}` + `{@render}` to extract micro‑templates from monolith components.

### Type safety quick wins

- Regenerate Supabase types; enable strictness options (noUncheckedIndexedAccess, exactOptionalPropertyTypes) if feasible.
- Replace `as any` with typed Zod schemas on load/actions, infer types from `z.infer`.
- Type `load` returns and `PageData` explicitly; use `satisfies` to ensure shape compatibility.
- Add a CI step to fail on `any` occurrences in `src/lib/server/**` and `src/routes/**`.

### Supabase security & DB

- RLS: start deny‑all; add read/write policies per role; include matrix tests (anon/authenticated/owner/admin).
- Functions: enforce `SECURITY DEFINER SET search_path = public`; validate args; return minimal columns.
- Indexes: verify for all FK/lookup columns hit in top queries; use partial indexes for common filters.
- Auth: enable HIBP leaked password checks; OTP expiry 10–30m; apply basic rate limiting.
- Pooling: ensure server‑side clients reuse connections; cache service role only server‑side.

### CORS/CSP consistency

- Single source of truth via env: `PUBLIC_APP_URL`, `ALLOWED_ORIGINS`, support email/socials.
- Remove `'unsafe-eval'` from platform headers; prefer style nonces/hashes when ready.
- Verify headers in preview using browser network inspector; document expected policies.

### Imaging consolidation

- One surface API: `image.server.ts` (signed transform URL builder) + `image.client.ts` (srcset/sizes helper).
- Standard breakpoints (e.g., 320/480/768/1024/1440/1920); defaults for quality/format.
- SSR‑safe helpers; avoid client‑side `URL` construction with secrets.

### UI decomposition targets (first pass)

- Extract atoms/molecules used across pages: Button, Input, Select, Badge, EmptyState, Pagination, Table, Drawer/Sheet, Skeleton.
- Split: `ProfileSetupWizard`, `CategoryLanding`, `MessageThread`, `OrderList` into feature atoms + presentational components.

### Testing & quality gates

- Add route smoke tests for top pages; screenshot tests for critical flows.
- Add RLS policy tests (matrix by role) + unit tests for image helpers.
- Accessibility: run axe on key pages; ensure focus management in drawers/modals.
- CI: typecheck, lint, unit, e2e, build; forbid `on:` handlers via ESLint rule; fail on `console.log` in src.

### Observability & operations

- Ensure Sentry DSN, release, env set; upload sourcemaps in CI.
- Redact PII in server logs; add Server‑Timing for key load steps.
- Track Web Vitals to `web_vitals` table; watch p95 LCP/CLS.

### Performance budgets

- Target <200KB JS per route (gz). Lazy‑load charts/editors; tree‑shake dates/lodash.
- Route‑level `manualChunks`; dynamic import heavy libs only where needed.

### Accessibility & i18n

- Semantic headings/order, labels on form controls, focus traps in modals.
- No hardcoded UI strings; surface missing translations in dev.

### Risk review hotspots

- Onboarding flows, email deep links (domain), social links in mobile menu, service worker update path, logging in `WelcomeModal`.

### Quick wins today (2 hours)

- Remove `'unsafe-eval'` from `vercel.json` and redeploy preview to verify headers.
- Add `.gitignore` entries for `playwright-report/`, `test-results/`, logs; delete committed artifacts/backups.
- Centralize `PUBLIC_SUPPORT_EMAIL` and replace literals.

### Non‑goals for this sprint

- Visual redesign; auth/provider swap; DB vendor migration.

### Definition of done for this iteration

- 0 TypeScript errors; no `on:` handlers; CSP aligned; RLS tests pass; e2e green; no console errors; performance and a11y checks at target thresholds.
