import type { SupabaseClient, Session, User } from '@supabase/supabase-js'
import type { Database } from '$lib/types/database'

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>
			locale: string
		}
		interface PageData {
			session: Session | null
			user: User | null
			locale?: string
		}
		// interface PageState {}
		// interface Platform {}
	}
	
	// Turnstile CAPTCHA types
	interface Window {
		turnstile?: {
			render: (container: HTMLElement, options: {
				sitekey: string
				callback?: (token: string) => void
				'expired-callback'?: () => void
				'error-callback'?: () => void
				'timeout-callback'?: () => void
				'before-interactive-callback'?: () => void
				'after-interactive-callback'?: () => void
				'unsupported-callback'?: () => void
				theme?: 'light' | 'dark' | 'auto'
				size?: 'normal' | 'compact' | 'flexible'
				appearance?: 'always' | 'execute' | 'interaction-only'
				'response-field'?: boolean
				'response-field-name'?: string
				'retry'?: 'auto' | 'never'
				'retry-interval'?: number
				'refresh-expired'?: 'auto' | 'manual' | 'never'
				'refresh-timeout'?: 'auto' | 'manual' | 'never'
				language?: string
				execution?: 'render' | 'execute'
				cData?: string
				action?: string
			}) => string
			reset: (widgetId?: string) => void
			remove: (widgetId?: string) => void
			getResponse: (widgetId?: string) => string | undefined
			execute: (container?: string | HTMLElement, options?: object) => void
			isExpired: (widgetId?: string) => boolean
		}
		onTurnstileLoad?: () => void
	}
}

export {}
