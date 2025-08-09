# UI/UX Improvement & Refactor Plan (Svelte 5 • SvelteKit 2 • TailwindCSS • shadcn-svelte)

Goal: Elevate the entire product’s UI/UX (mobile-first) for a modern, clean, conversion-focused clothing marketplace. Keep all features and layout semantics, improve quality, consistency, speed, and accessibility.

Non-goals: No new business features. No disruptive redesigns; incremental, measured upgrades.

Guiding principles

- Mobile-first; progressive enhancement
- Consistency via a lightweight design system (tokens + primitives)
- Accessibility AA+; keyboard-first interactions
- Perceived performance (skeletons, eager above-the-fold)
- Conversion clarity: primary CTA prominence, frictionless flows
- Svelte 5 idioms ($state/$derived), server-first where possible

Deliverables

- Design tokens in Tailwind theme (color, spacing, radius, shadows, typography)
- shadcn-svelte style UI primitives (Button, Input, Select, Dialog, Sheet, DropdownMenu, Tabs, Tooltip, Skeleton, Badge, Card, Pagination)
- Page-by-page refactor with checklists and acceptance criteria
- Accessibility and performance baselines across pages

---

Design System & Foundations

- Tailwind config
  - [ ] Define semantic color palette (bg, fg, muted, primary, destructive, ring)
  - [ ] Typography scale (12–18 base, 1.125 modular), line-heights, tracking
  - [ ] Spacing scale and container widths (xs→2xl) with safe areas
  - [ ] Radius tokens (sm/md/lg/full), shadows (sm/md/lg/outline)
  - [ ] Motion tokens for transitions (duration, easing), reduced motion
- UI primitives (shadcn-svelte equivalents)
  - [ ] Button (variants: default, outline, ghost, icon, destructive; sizes)
  - [ ] Input, Textarea, Select, Combobox, Checkbox, Radio, Toggle
  - [ ] Dialog/Modal, Sheet/Drawer (mobile filters/cart), Popover, Tooltip
  - [ ] Tabs, Accordion, Breadcrumbs, Pagination
  - [ ] Card, Badge, Alert, Skeleton, Separator, Progress
  - [ ] Toasts (svelte-sonner already used) unified styling
- Patterns
  - [ ] Form field with label, hint, error; Zod-driven messages
  - [ ] List/Grid wrappers (gaps, responsive columns)
  - [ ] Media aspect-ratio utilities for product images (1:1, 4:5)

Acceptance criteria

- [ ] One source of truth for tokens; no inline magic numbers
- [ ] All primitives documented in `src/lib/components/ui` with Story-like sandboxes

---

Global Layout & Navigation

- Header
  - [ ] Compact mobile header with search trigger; sticky with shadow on scroll
  - [ ] Clear primary CTA (Sell / Register) state-aware
  - [ ] Locale switch preserves URL prefix (/bg stays /bg)
- Search
  - [ ] Command palette-style quick search on desktop
  - [ ] Full-screen Sheet on mobile for search
- Navigation
  - [ ] Bottom nav on mobile (Home, Browse, Sell, Cart, Profile)
  - [ ] Breadcrumbs on browse/details
- Footer
  - [ ] Slim, trust signals, policies, contact

Acceptance criteria

- [ ] Sticky header doesn’t shift layout; no CLS
- [ ] Locale preserved through all nav/refresh

---

Page-by-Page Plan (mobile-first)

1. Home (/)

- Improvements
  - [ ] Hero with concise value prop; single primary CTA
  - [ ] Featured categories grid (2 cols mobile → 4/6 desktop)
  - [ ] Featured products carousel (swipe, snap points)
  - [ ] Trust badges (returns, secure payments, support)
  - [ ] Skeletons for product and hero
- Conversion
  - [ ] Above-fold CTA; social proof module (ratings, top sellers)
- Acceptance
  - [ ] TTI < 2.5s p75; CLS < 0.05; Lighthouse ≥ 90

2. Browse (/browse, /category/[slug])

- Improvements
  - [ ] Filters in mobile Sheet; sticky sort + filter bar
  - [ ] Product card v2: bigger imagery, price/discount badge, quick-add
  - [ ] Infinite scroll with sentry; SSR+hydrate first page
  - [ ] Save/wishlist heart interaction (optimistic)
- Acceptance
  - [ ] Filter interactions < 150ms; no page jank

3. Search results (/search)

- Improvements
  - [ ] Query pill, filters as facets, recent searches, suggestions
  - [ ] Empty state with helpful next actions
- Acceptance
  - [ ] Keyboard-friendly: focus trap in mobile search sheet

4. Product detail (/listings/[id])

- Improvements
  - [ ] Gallery with pinch/zoom, thumbnail rail (carousel on mobile)
  - [ ] Sticky add-to-cart on mobile bottom; visible price + size selector
  - [ ] Size guide, shipping/returns accordion, reviews with media
  - [ ] Rich metadata (condition, brand, material)
- Conversion
  - [ ] Clear CTAs; low distraction; above-fold add-to-cart
- Acceptance
  - [ ] Add-to-cart < 100ms UI response; no layout shifts on variant change

5. Cart & Checkout

- Improvements
  - [ ] Drawer cart on desktop; full page on mobile
  - [ ] Progress indicator (Cart → Address → Payment → Review)
  - [ ] Address autocomplete; save addresses
  - [ ] Coupon entry with inline validation
- Conversion
  - [ ] Guest checkout (if applicable), minimal fields, payment trust marks
- Acceptance
  - [ ] Abandonment instrumentation; payment errors readable

6. Auth (login/register/reset)

- Improvements
  - [ ] One-column forms; social logins; passwordless option
  - [ ] Clear error/success states; disable during submit; progressive disclosure
- Acceptance
  - [ ] All redirects locale-aware; visual parity maintained

7. Onboarding (personal/brand)

- Improvements
  - [ ] Fix step logic (unique keys, no duplicate IDs)
  - [ ] Wizard with clear progress, optional payment step, brand info gated
  - [ ] Server actions for mutations; optimistic UI
- Acceptance
  - [ ] Cannot get stuck; completion redirects to localized home

8. Profile (user) and Settings

- Improvements
  - [ ] Tabbed sections (Profile, Orders, Saved, Settings)
  - [ ] Avatar upload with crop; inline validations
- Acceptance
  - [ ] Forms resilient on mobile; keyboard-safe (avoid covered inputs)

9. Brand pages

- Improvements
  - [ ] Hero with brand avatar, cover, follow; product grid
  - [ ] Contact/social links; verified badge
- Acceptance
  - [ ] Fast grid LCP; consistent slugs; 404 fallback

10. Sell flow

- Improvements
  - [ ] Multi-step form in Tabs (Details, Media, Pricing, Publish)
  - [ ] Drag-drop, client-side image compression, reordering
- Acceptance
  - [ ] Draft auto-save; image upload progress + retry

11. Dashboard (seller)

- Improvements
  - [ ] Cards for KPIs; tables for orders/listings (responsive)
  - [ ] Filters by status/date; empty states
- Acceptance
  - [ ] No horizontal scroll on mobile; accessible tables

12. Wishlist, Orders, Messages

- Improvements
  - [ ] Card lists with actions; skeletons; empty states with CTAs
- Acceptance
  - [ ] 60fps while scrolling lists; virtualization if needed

13. Static pages (Privacy, Terms, Help)

- Improvements
  - [ ] Prose styling; TOC; last updated; i18n

14. Error pages (404/500)

- Improvements
  - [ ] Friendly copy; CTA back to browse; report issue link

---

Components to Refactor (priority)

- ProductCard
  - [ ] Image ratio, hover elevation, wishlist, quick-add
  - [ ] Price with discount badge, rating stars
- Filters
  - [ ] Sheet on mobile, Sidebar on desktop; Checkbox/Accordion facets
- Header/Search
  - [ ] SearchSheet, CommandPalette (desktop), debounced results
- Cart
  - [ ] CartDrawer, LineItem, QuantityStepper, Summary card
- Forms
  - [ ] Field, Label, Description, Message; integrate with Zod
- Review/Rating
  - [ ] Stars, distribution bars, media gallery

---

Accessibility & Internationalization

- [ ] ARIA roles for nav, search, breadcrumbs, carousels
- [ ] Focus management in Dialog/Sheet/Popovers; focus-visible only
- [ ] Keyboard navigation for all interactive elements
- [ ] Color contrast ≥ 4.5:1; theming respects prefers-color-scheme
- [ ] Locale-safe formatting: dates, currency; no baked strings

---

Performance

- [ ] Image optimization: responsive sizes, lazy below fold, preload hero
- [ ] Defer non-critical JS; islands for heavy widgets
- [ ] TanStack Query caching windows; skeletons vs spinners
- [ ] Route-level code-splitting; avoid clientifying server code
- [ ] Measure with Lighthouse and Web Vitals; set budgets

Budgets (per page)

- [ ] LCP < 2.5s p75, CLS < 0.05, JS ≤ 170KB gz per route (initial)

---

Analytics & Experimentation

- [ ] Define events: view_item, add_to_cart, begin_checkout, purchase
- [ ] Track filter usage, search refinement, scroll depth
- [ ] A/B test: product card variants, sticky CTAs, review placement

---

Execution Plan
Wave 0 – Foundations (tokens, primitives) [2–3 days]

- Tailwind theme, primitives in ui/
- Replace ad-hoc buttons/inputs incrementally

Wave 1 – Nav, Header, Search [2–3 days]

- Sticky header, mobile search sheet, locale switch retention

Wave 2 – Product surfacing [4–6 days]

- ProductCard v2, Browse filters sheet/side, grid performance

Wave 3 – PDP & Cart/Checkout [5–7 days]

- PDP gallery/sticky CTA, Cart drawer, streamlined checkout

Wave 4 – Auth & Onboarding [3–4 days]

- Unified forms, wizard fix, server actions

Wave 5 – Profile/Brand/Dashboard [4–6 days]

- Tabs, tables, KPI cards; brand hero/grid

Wave 6 – Polish, A11y, Perf [ongoing]

- Audits, budgets, experiments

---

Checklists to Start

- [ ] Create `src/lib/components/ui/` with primitives
- [ ] Tailwind theme tokens updated; document in README
- [ ] Replace Button/Input across top 5 pages
- [ ] Implement ProductCard v2 + skeletons
- [ ] Implement Filters (Sheet mobile, Sidebar desktop)
- [ ] Implement CartDrawer and sticky PDP CTA
- [ ] Make all redirects locale-aware (preserve /bg)
- [ ] Add Lighthouse and Axe checks to CI

Definition of Done (overall)

- [ ] Visual parity or better clarity; no regressions
- [ ] Mobile-first layouts validated on iOS/Android viewports
- [ ] Axe score ≥ 95; Lighthouse ≥ 90 across key pages
- [ ] Conversion KPIs improved (add-to-cart rate, checkout start)
- [ ] Locale persistence verified through auth/refresh
