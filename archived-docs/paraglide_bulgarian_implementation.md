# Paraglide JS Bulgarian Implementation Plan for Driplo v1

## Executive Summary

After extensive research of i18n solutions for Svelte applications in 2025, **Paraglide JS** emerges as the optimal choice for implementing Bulgarian localization in Driplo v1. This compiler-based solution offers superior performance through tree-shaking, type safety, and minimal bundle sizes - critical factors for an e-commerce platform.

## Why Paraglide JS?

### Performance Advantages
- **Tree-shakable message functions**: Only messages used on the current page are bundled
- **Zero runtime overhead**: Messages compile to pure JavaScript functions
- **No async waterfalls**: All translations available immediately
- **Smallest bundle sizes**: Up to 90% smaller than traditional i18n libraries

### Developer Experience
- **Full TypeScript support**: Message functions are fully typed
- **IntelliSense**: Autocomplete for all translation keys
- **Compile-time errors**: Catch missing translations during build
- **VS Code integration**: Sherlock extension for inline translation management

### Comparison with Alternatives

| Feature | Paraglide JS | svelte-i18n | typesafe-i18n |
|---------|--------------|-------------|---------------|
| Bundle Size | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Type Safety | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| DX | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| SvelteKit Integration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## Current State Analysis

### ✅ Already Implemented
- Paraglide JS core is installed
- Bulgarian locale ("bg") is configured in runtime
- Message files are compiled with Bulgarian translations
- Basic message structure exists

### ❌ Missing Components
- SvelteKit adapter not installed
- No i18n configuration file
- Translations not imported in components
- No language switching UI
- Missing hooks integration
- No URL-based routing

## Implementation Roadmap

### Phase 1: Complete Core Setup (Day 1)

#### 1.1 Install SvelteKit Adapter
```bash
npm i -D @inlang/paraglide-js-adapter-sveltekit
```

#### 1.2 Update vite.config.ts
```typescript
import { paraglide } from "@inlang/paraglide-js-adapter-sveltekit/vite"
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		paraglide({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
		}),
		sveltekit()
	],
	server: {
		port: 5190,
		strictPort: true
	}
});
```

#### 1.3 Create i18n Configuration
Create `src/lib/i18n.js`:
```javascript
import { createI18n } from "@inlang/paraglide-js-adapter-sveltekit"
import * as runtime from "$lib/paraglide/runtime.js"

export const i18n = createI18n(runtime);
```

#### 1.4 Update Root Layout
Update `src/routes/+layout.svelte`:
```svelte
<script>
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit'
	import { i18n } from '$lib/i18n.js'
	// ... existing imports
</script>

<ParaglideJS {i18n}>
	<div class="min-h-screen bg-background">
		<!-- existing content -->
	</div>
</ParaglideJS>
```

#### 1.5 Configure Hooks
Create `src/hooks.js`:
```javascript
import { i18n } from '$lib/i18n.js'
export const reroute = i18n.reroute()
```

Update `src/hooks.server.ts`:
```typescript
import { i18n } from '$lib/i18n.js'
import { sequence } from '@sveltejs/kit/hooks'
// ... existing imports

const handleParaglide = i18n.handle()

export const handle = sequence(handleParaglide, async ({ event, resolve }) => {
	// ... existing Supabase logic
})
```

### Phase 2: Translation Infrastructure (Day 2)

#### 2.1 Create Inlang Project Configuration
Create `project.inlang/settings.json`:
```json
{
	"$schema": "https://inlang.com/schema/project-settings",
	"sourceLanguageTag": "en",
	"languageTags": ["en", "bg"],
	"modules": [
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-json@latest/dist/index.js"
	],
	"plugin.inlang.json": {
		"pathPattern": "./messages/{languageTag}.json"
	}
}
```

#### 2.2 Create Translation Source Files
Create `messages/en.json`:
```json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"header_home": "Home",
	"header_browse": "Browse",
	"header_categories": "Categories",
	"header_sell_item": "Sell Item",
	"header_sign_in": "Sign In",
	"header_my_profile": "My Profile",
	"header_favorites": "Favorites",
	"header_messages": "Messages",
	"header_my_cart": "My Cart",
	"header_settings": "Settings",
	"header_search_placeholder": "Search for items...",
	"header_menu": "Menu"
}
```

Create `messages/bg.json`:
```json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"header_home": "Начало",
	"header_browse": "Разгледай",
	"header_categories": "Категории",
	"header_sell_item": "Продай",
	"header_sign_in": "Вход",
	"header_my_profile": "Моят профил",
	"header_favorites": "Любими",
	"header_messages": "Съобщения",
	"header_my_cart": "Кошница",
	"header_settings": "Настройки",
	"header_search_placeholder": "Търси продукти...",
	"header_menu": "Меню"
}
```

#### 2.3 Compile Translations
```bash
npx paraglide-js compile --project ./project.inlang
```

### Phase 3: Component Integration (Day 3)

#### 3.1 Update Components to Use Translations
Example for Header.svelte:
```svelte
<script>
	import * as m from '$lib/paraglide/messages.js'
	// ... existing imports
</script>

<nav>
	<a href="/">{m.header_home()}</a>
	<a href="/browse">{m.header_browse()}</a>
	<!-- etc -->
</nav>
```

#### 3.2 Create Language Switcher Component
Create `src/lib/components/layout/LanguageSwitcher.svelte`:
```svelte
<script>
	import { page } from '$app/stores'
	import { i18n } from '$lib/i18n.js'
	
	$: currentLanguage = i18n.getLanguageFromUrl($page.url)
</script>

<select on:change={(e) => i18n.switchLanguage(e.target.value)}>
	<option value="en" selected={currentLanguage === 'en'}>English</option>
	<option value="bg" selected={currentLanguage === 'bg'}>Български</option>
</select>
```

### Phase 4: Bulgarian Regional Settings (Day 4)

#### 4.1 Currency Configuration
Create `src/lib/utils/currency.js`:
```javascript
export function formatCurrency(amount, locale) {
	const currency = locale === 'bg' ? 'BGN' : 'USD';
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(amount);
}
```

#### 4.2 Date/Time Formatting
```javascript
export function formatDate(date, locale) {
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeZone: locale === 'bg' ? 'Europe/Sofia' : 'America/New_York'
	}).format(date);
}
```

#### 4.3 Regional Data
Update database/constants for Bulgarian regions:
```javascript
export const BULGARIAN_REGIONS = [
	{ id: 'sofia', name: 'София', nameEn: 'Sofia' },
	{ id: 'plovdiv', name: 'Пловдив', nameEn: 'Plovdiv' },
	{ id: 'varna', name: 'Варна', nameEn: 'Varna' },
	{ id: 'burgas', name: 'Бургас', nameEn: 'Burgas' },
	// ... etc
];
```

### Phase 5: Testing & Optimization (Day 5)

#### 5.1 Testing Checklist
- [ ] Language switching works correctly
- [ ] All UI text is translated
- [ ] Currency displays correctly (BGN for Bulgarian)
- [ ] Dates format according to Bulgarian standards
- [ ] URLs update when switching languages (optional)
- [ ] Language preference persists across sessions
- [ ] No layout breaks with longer Bulgarian text
- [ ] SEO tags include hreflang attributes

#### 5.2 Performance Verification
- [ ] Bundle size analysis per route
- [ ] Verify tree-shaking is working
- [ ] Check no unused translations are bundled
- [ ] Lighthouse scores remain high

## Best Practices & Guidelines

### 1. Message ID Conventions
```
pattern: section_component_action
examples:
- header_navigation_home
- listing_card_price
- profile_settings_save
```

### 2. Translation Guidelines
- Keep messages concise and reusable
- Use parameters for dynamic content: `{name}`
- Avoid HTML in translations
- Consider text length differences (BG often 20-30% longer)

### 3. Development Workflow
```bash
# After updating translations
npm run paraglide:compile

# Watch mode during development
npm run paraglide:watch
```

### 4. Component Patterns
```svelte
<!-- Always import at top -->
<script>
import * as m from '$lib/paraglide/messages.js'
</script>

<!-- Use message functions -->
<button>{m.button_save()}</button>

<!-- With parameters -->
<p>{m.welcome_user({ name: userName })}</p>
```

### 5. Common Pitfalls to Avoid
- ❌ Don't concatenate translations
- ❌ Don't use dynamic message keys
- ❌ Don't forget to compile after changes
- ❌ Don't hardcode any user-facing text

## Migration Checklist

### Pre-Implementation
- [x] Research i18n solutions
- [x] Analyze current codebase
- [x] Document implementation plan
- [ ] Backup current state

### Implementation
- [ ] Install dependencies
- [ ] Configure Paraglide
- [ ] Set up project structure
- [ ] Create base translations
- [ ] Integrate with components
- [ ] Add language switcher
- [ ] Configure regional settings

### Post-Implementation
- [ ] Test all features in both languages
- [ ] Verify performance metrics
- [ ] Update documentation
- [ ] Train team on new workflow

## Success Metrics
- Page load time < 2s on 3G
- Bundle size increase < 5KB per route
- 100% UI text translatable
- Zero runtime translation errors
- Language switch < 100ms

## Resources
- [Paraglide Documentation](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [SvelteKit Adapter Guide](https://inlang.com/m/dxnzrydw/paraglide-sveltekit-i18n)
- [Inlang Project Setup](https://inlang.com/documentation)
- [VS Code Sherlock Extension](https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension)

## Conclusion

Paraglide JS provides the perfect balance of performance, developer experience, and maintainability for Driplo's Bulgarian localization. Its compile-time approach aligns perfectly with Svelte's philosophy, ensuring the smallest possible bundle sizes while maintaining full type safety.

The implementation can be completed in 5 days, with immediate benefits in performance and long-term benefits in maintainability. The tree-shaking capabilities alone justify the choice, especially as Driplo scales to more languages in the future.