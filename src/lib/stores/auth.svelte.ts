import { browser } from '$app/environment'
import type { User, Session } from '@supabase/supabase-js'
import { logger } from '$lib/utils/logger'

class AuthStore {
	#user = $state<User | null>(null)
	#session = $state<Session | null>(null) 
	#profile = $state<Record<string, unknown> | null>(null)

	get user() {
		return this.#user
	}

	get session() {
		return this.#session
	}

	get profile() {
		return this.#profile
	}

	// Initialize from page data
	initialize(initialUser: User | null, initialSession: Session | null, initialProfile?: Record<string, unknown>) {
		if (browser) {
			this.#user = initialUser
			this.#session = initialSession
			this.#profile = initialProfile || null
		}
	}

	// Listen for auth changes
	setupListener(supabase: unknown) {
		if (browser) {
			const {
				data: { subscription }
			} = supabase.auth.onAuthStateChange(async (event: string, authSession: Session | null) => {
				this.#user = authSession?.user ?? null
				this.#session = authSession
				
				// Load profile when user changes
				if (authSession?.user) {
					try {
						const { data, error } = await supabase
							.from('profiles')
							.select('*')
							.eq('id', authSession.user.id)
							.single()
						
						if (error) {
							logger.error('Profile query failed', { error })
							this.#profile = null
						} else {
							this.#profile = data
						}
					} catch (error) {
						logger.error('Profile loading failed', { error })
						this.#profile = null
					}
				} else {
					this.#profile = null
				}
			})

			return () => subscription.unsubscribe()
		}
	}

	// Manual setters for direct updates
	setUser(user: User | null) {
		this.#user = user
	}

	setSession(session: Session | null) {
		this.#session = session
	}

	setProfile(profile: Record<string, unknown> | null) {
		this.#profile = profile
	}
}

// Export singleton instance
export const authStore = new AuthStore()

// Export backward-compatible functions
export function initializeAuth(initialUser: User | null, initialSession: Session | null, initialProfile?: Record<string, unknown>) {
	return authStore.initialize(initialUser, initialSession, initialProfile)
}

export function setupAuthListener(supabase: unknown) {
	return authStore.setupListener(supabase)
}

// Export reactive getters for components
export const user = () => authStore.user
export const session = () => authStore.session  
export const profile = () => authStore.profile