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
}

export {}
