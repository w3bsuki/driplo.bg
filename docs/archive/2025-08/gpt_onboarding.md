# Auth, Onboarding, and Locale Audit (Svelte 5 / SvelteKit 2 / Supabase)

Scope:

- Onboarding UX (personal vs brand), data flow, and persistence
- Supabase Auth integration (SSR, cookies, session, RLS assumptions)
- Locale persistence and routing (/bg, /en), cookie behavior

---

Key Findings (TL;DR)

- Onboarding "stuck after choosing brand" is caused by duplicate step IDs in `ProfileSetupWizard.svelte`. When brand is selected, the dynamic Brand step gets the same `id` as the Complete step, preventing progress beyond Brand.
- Several auth redirects are not locale-aware (`/login`, `/logout`, `/onboarding`, etc.), causing locale loss on refresh or after redirects.
- Client-side writes during onboarding (direct `supabase.from('profiles')` and `brand_profiles`) should be moved to server actions/APIs to enforce RLS and reduce client trust surface.
- Locale cookie strategy is mostly correct (`PARAGLIDE_LOCALE`), but ensure all redirects resolve with `localizeHref(...)` and that fallbacks redirect to the preferred locale on non-prefixed URLs.

---

Onboarding Audit
Files reviewed:

- `src/routes/(app)/onboarding/+page.server.ts`
- `src/routes/(app)/onboarding/+page.svelte`
- `src/lib/components/onboarding/ProfileSetupWizard.svelte`
- `src/lib/components/onboarding/AccountTypeSelector.svelte`
- `src/routes/(app)/brands/onboarding/+page.server.ts`
- `src/routes/(app)/brands/onboarding/+page.svelte`

Problems:

1. Duplicate Step IDs cause a dead-end when selecting brand
   - File: `src/lib/components/onboarding/ProfileSetupWizard.svelte`
   - Root cause: `getBrandStep()` assigns `id: needsUsernameSetup ? 5 : 4`, which collides with the existing Complete step IDs (5 or 4). With duplicates, `currentStep` stays on the first matching ID (Brand) and cannot advance to Complete.
   - Symptom: "I get stuck when I choose personal/brand" (brand path).

2. Client-side direct DB writes during onboarding
   - Files: `+page.svelte` and `ProfileSetupWizard.svelte`
   - Issue: Direct `.update()`/`.insert()` from the browser increases surface for misuse; relies entirely on RLS for safety. Better: post to server actions (SvelteKit `actions`) or API routes that validate and constrain mutations.

3. Inconsistent prop/data passing
   - File: `src/routes/(app)/brands/onboarding/+page.svelte`
   - Passes `supabase={data.supabase}`, but the server `load` does not return `supabase`. Likely unused/undefined prop.

4. Missing localized redirects
   - Example: After completing onboarding, `goto(localizedHomeUrl)` is handled. Good.
   - Elsewhere, other routes redirect to non-localized paths (see Auth audit) that bounce users out of `/bg`.

Fix Plan:

- Replace numeric `id`s with unique step keys (e.g., 'USERNAME', 'ACCOUNT_TYPE', 'PROFILE', 'PAYMENT', 'BRAND', 'COMPLETE').
- Track `currentStepIndex` by array index rather than relying on `id` equality with duplicates.
- Move mutations to server: `?/save-step`, `?/complete` actions or `/api/onboarding/*` with Zod validation; keep UI identical.
- Remove/stop passing undefined `supabase` prop in brand onboarding page; create browser client locally if truly needed.

Checks:

- [ ] Profile steps progress correctly for both personal and brand selections.
- [ ] Brand step appears only when `accountType === 'brand'` and completion advances to Complete.
- [ ] Server actions validate input and respect RLS.

---

Auth Audit (Supabase best practices)
Files reviewed:

- `src/hooks.server.ts` (createServerClient, cookie handling, `safeGetSession`)
- `src/routes/login/+page.server.ts` (password/OAuth)
- `src/routes/register/+page.server.ts` (signUp, signOut)
- `src/routes/auth/callback/+server.ts` (exchangeCode, profile init, locale-aware redirects)
- `src/routes/logout/+server.ts`
- `src/lib/stores/auth.ts`

Strengths:

- Server client via `createServerClient<Database>` and cookie shims is correct.
- `safeGetSession` validates the JWT via `getUser()` before trusting the session.
- Sentry integration with user context (server) and CSP hardening.

Gaps and Actions:

1. Locale-agnostic redirects
   - `login`, `logout`, `register` use absolute paths like `/login`, `/onboarding`.
   - Action: always localize redirects with `localizeHref(path, { locale })` using cookie `PARAGLIDE_LOCALE` or `locals.locale`.
   - Files to fix:
     - `src/routes/login/+page.server.ts` (redirect to onboarding, redirectTo)
     - `src/routes/logout/+server.ts`
     - `src/routes/register/+page.server.ts`

2. Server-only auth mutations
   - Keep all auth state transitions on server (already OK). Ensure onboarding profile writes move server-side too.

3. Input validation
   - Use Zod schemas in actions to validate onboarding/profile updates.

4. RLS alignment
   - Ensure tables `profiles`, `brand_profiles` enforce `auth.uid() = id/user_id`. Add tests.

5. Session refresh
   - The `hooks.server.ts` cookie handling is correct. Ensure no other code overwrites auth cookies with `httpOnly: false`.

Checks:

- [ ] All redirects use `localizeHref`.
- [ ] All onboarding writes moved to actions/API with validation.
- [ ] RLS policies exist and are tested for `profiles`, `brand_profiles`.

---

Locale Persistence Audit
Files reviewed:

- `src/hooks.server.ts` (Paraglide middleware, `PARAGLIDE_LOCALE` cookie)
- `src/lib/i18n.ts`
- `src/routes/auth/callback/+server.ts`
- Various routes with redirects

Observations:

- `PARAGLIDE_LOCALE` is set (non-HTTPOnly) and persisted for 1 year. Good for client switchers.
- `auth/callback` uses `localizeHref(...)`. Good.
- Several routes still redirect to non-localized paths which likely reset user into default locale.

Recommended Behavior:

- If a request arrives without a locale prefix, redirect to the preferred locale using `PARAGLIDE_LOCALE` (or default). Paraglide middleware usually handles this; verify config.
- Localize every redirect with `localizeHref()` using `cookies.get('PARAGLIDE_LOCALE') || locals.locale || 'en'`.

Checks:

- [ ] Refresh on `/bg/...` stays on `/bg/...` (no loss of prefix).
- [ ] All server redirects are locale-aware.

---

Concrete Fixes (PR checklist)
Onboarding

- [ ] ProfileSetupWizard: replace numeric IDs with unique keys, e.g.:
      const steps = [{ key: 'ACCOUNT_TYPE', ... }, ...]
      const brandStep = { key: 'BRAND', ... }
      Insert `brandStep` before COMPLETE when `accountType === 'brand'`.
- [ ] Advance by index: `currentIdx + 1`, not by reusing potentially duplicated IDs.
- [ ] Move `.update()`/`.insert()` calls to server actions: - `?/save-step` to persist username/account_type/profile/payment partials - `?/create-brand` to create `brand_profiles` - `?/complete` to set `onboarding_completed` and finalize
- [ ] Wire client to call actions with `enhance(...)` or `fetch` to endpoints.
- [ ] Remove `supabase={data.supabase}` from `brands/onboarding/+page.svelte` or provide browser client locally.

Auth + Locale

- [ ] login `+page.server.ts`: when redirecting to onboarding, use:
      const locale = cookies.get('PARAGLIDE_LOCALE') || locals.locale || 'en'
      throw redirect(303, localizeHref('/onboarding', { locale }))
- [ ] logout `+server.ts`: same pattern for `/login`.
- [ ] register `+page.server.ts`: same pattern for success/errors.
- [ ] hooks: ensure non-prefixed routes 302 → preferred locale prefix (if Paraglide config isn’t already enforcing).

Security / RLS

- [ ] Verify RLS:
      profiles: user can select/update only `id = auth.uid()`
      brand_profiles: only `user_id = auth.uid()`
- [ ] Add tests to assert RLS blocks cross-user changes.

Validation

- [ ] Zod schemas for onboarding payloads in server actions.
- [ ] Return structured errors; map to toasts.

Testing

- [ ] Playwright: complete onboarding as personal → home.
- [ ] Playwright: complete onboarding as brand → brand form → complete → home.
- [ ] Playwright: verify all redirects keep current locale.

---

Potential Code Hotspots (to update)

- `src/lib/components/onboarding/ProfileSetupWizard.svelte` (step IDs/flow)
- `src/routes/(app)/onboarding/+page.svelte` (client writes → server actions)
- `src/routes/(app)/brands/onboarding/+page.svelte` (prop cleanup)
- `src/routes/login/+page.server.ts` (locale redirects)
- `src/routes/register/+page.server.ts` (locale redirects)
- `src/routes/logout/+server.ts` (locale redirects)
- `src/hooks.server.ts` (optional: enforce locale prefix fallback)

---

Open Questions

- Confirm Paraglide configuration (prefix strategy, available locales). Ensure generated files exist at `$lib/paraglide/*`.
- Should onboarding write any payment data, or is it entirely optional at MVP?

---

Status: Ready to implement quick fixes (IDs, redirects), then move writes server-side.
