# Root Cause Analysis and Refactor Guide (gpt_fix)

Goal: Fix the onboarding "stuck on brand/personal" issue without changing UX/visuals. Clean up related risks (client-side writes, i18n consistency, types), add checks, and verify with tests.

---

## TL;DR Root Cause

- Duplicate step IDs in `ProfileSetupWizard.svelte` when account type is "brand" create a navigation deadlock.
  - Evidence:
    - `src/lib/components/onboarding/ProfileSetupWizard.svelte`
      - STEPS assigns "Complete" id 5 (or 4 if username not needed).
      - `getBrandStep()` returns `id: needsUsernameSetup ? 5 : 4` (same as "Complete").
      - Brand step is inserted before Complete: `steps.splice(-1, 0, brandStep)`.
      - The wizard tracks `currentStep` by id and derives index via `findIndex(step => step.id === currentStep)`. With duplicate ids, `currentStep` never advances (moving from Brand to Complete keeps id the same), so the UI appears stuck.

---

## Secondary Issues Discovered

1. Client-side writes in onboarding flow

- Multiple inserts/updates (profiles, brand_profiles, RPC) are executed from the browser, risking RLS failures, race conditions, and inconsistent state on refresh.

2. Inconsistent redirection/i18n usage

- Most redirects use `localizeHref`, but consistency across onboarding/login/logout/completion should be enforced to preserve `/bg` URLs.

3. Supabase types and any-casts

- `brand_verification_requests` accessed with `as any` in several server loads. Types should be generated/added to `database.types.ts` to regain type safety.

4. Stray corrupted filename

- File `Kdriplo-blue-mainsrclibutilsresponsive-image.ts` at repo root can confuse tooling and lint/type discovery.

---

## Fix Plan (Parity-Preserving)

### A) Onboarding step engine (Primary fix)

- [ ] Switch from id-based navigation to index-based navigation, or guarantee unique IDs after the dynamic step list is built.
  - Option 1 (preferred): Track `currentStepIndex` state, derive `currentStep = activeSteps[currentStepIndex]`, advance by `currentStepIndex++`.
  - Option 2: After computing `activeSteps`, map to inject a unique runtime key (e.g., `uid = i+1`) and use `uid` for navigation and `<#key>` blocks.
- [ ] Ensure the dynamically inserted Brand step never collides with Complete:
  - Brand step sits before Complete, but must not reuse Complete’s id.
- [ ] Keep the UI/layout identical (headings, progress, buttons, copy).

### B) Server actions for persistence

- [ ] Move all data writes out of the wizard (client) into `+page.server.ts` actions:
  - `saveStep` action: Upsert profile partials at each step (username/accountType/profile/payment).
  - `createBrand` action: Insert into `brand_profiles` with validated payload.
  - `complete` action: Mark `onboarding_completed = true`, `onboarding_step = final`, `needs_username_setup = false`.
- [ ] Add Zod schemas in `src/lib/schemas/` for each action payload.
- [ ] Return minimal data to the client to keep state in sync; continue to use same UI.

### C) i18n and redirects

- [ ] Standardize final navigation with `getLocale()` + `localizeHref()` after completion.
- [ ] Verify auth callback/login/logout/onboarding routes use localized redirects.
- [ ] Keep `PARAGLIDE_LOCALE` cookie logic in `hooks.server.ts` intact.

### D) Supabase types and RLS

- [ ] Regenerate `src/lib/database.types.ts` from Supabase to include `brand_verification_requests` (remove `as any`).
- [ ] Confirm RLS policies support onboarding writes via server actions.

### E) Repo hygiene

- [ ] Remove or move `Kdriplo-blue-mainsrclibutilsresponsive-image.ts` to `src/lib/utils/responsive-image.ts` (if used). Update imports.
- [ ] Run `svelte-check` and ESLint; fix any newly surfaced issues.

---

## Implementation Checklist

- Onboarding step engine
  - [ ] Replace `currentStep` (id) with `currentStepIndex` (number).
  - [ ] Use `<#key activeSteps[currentStepIndex].uid>` or index-based key to force correct re-rendering.
  - [ ] Ensure `isLastStep` uses length/index, not id comparisons.
  - [ ] Update back/next handlers to mutate index, not id.
  - [ ] Adjust progress bar calculation to index-based.

- Server actions
  - [ ] `src/routes/(app)/onboarding/+page.server.ts`: define actions `{ saveStep, createBrand, complete }`.
  - [ ] Validate with Zod; coerce strings; lowercase username.
  - [ ] Return structured success/error and updated partial profile.
  - [ ] Replace client-side Supabase calls in wizard with `enhance` form submits or `fetch` to actions.

- i18n
  - [ ] Use `getLocale()` and `localizeHref('/', { locale })` for completion redirect.
  - [ ] Check login/logout/register flows for consistent localized redirects.

- Types & DB
  - [ ] `supabase gen types typescript --project-id ... > src/lib/database.types.ts` (or your CI job) to include all tables.
  - [ ] Remove all `as any` casts for `brand_verification_requests` usages.

- Hygiene
  - [ ] Delete or relocate corrupted `responsive-image.ts` path at repo root.
  - [ ] Re-run `pnpm check` and `pnpm lint`.

---

## Test Plan

- Playwright E2E
  - [ ] Username + Personal user path: complete wizard successfully; redirected to localized home.
  - [ ] Brand user path: includes Brand step; completes successfully; localized redirect.
  - [ ] Refresh resilience: refresh on each step and continue without data loss.

- Unit/Component
  - [ ] Step builder returns unique keys for both personal and brand flows.
  - [ ] No duplicate ids when Brand step is present.

- Accessibility
  - [ ] Axe smoke tests pass on onboarding wizard pages.

---

## Acceptance Criteria

- [ ] No deadlock on brand onboarding; navigation proceeds to Complete.
- [ ] No client-side writes of onboarding data; server actions handle all persistence.
- [ ] Localized redirects preserved (`/bg` when active).
- [ ] No `as any` on brand verification tables; types compile cleanly.
- [ ] `svelte-check` and ESLint pass (no new errors introduced by this change).

---

## Notes & References

- Primary evidence: `src/lib/components/onboarding/ProfileSetupWizard.svelte` — conflicting IDs between Brand Info and Complete steps cause a stuck state when advancing.
- Keep UI/UX and copy unchanged. This refactor only fixes control flow and hardens persistence.
