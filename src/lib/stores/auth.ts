import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import type { User, Session } from '@supabase/supabase-js'
import { logger } from '$lib/utils/logger'

// Simple reactive stores
export const user = writable<User | null>(null)
export const session = writable<Session | null>(null)
export const profile = writable<Record<string, unknown> | null>(null)

// Initialize from page data
export function initializeAuth(initialUser: User | null, initialSession: Session | null, initialProfile?: Record<string, unknown>) {
	if (browser) {
		user.set(initialUser)
		session.set(initialSession)
		profile.set(initialProfile || null)
	}
}

// Listen for auth changes
export function setupAuthListener(supabase: unknown) {
	if (browser) {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (event: string, authSession: Session | null) => {
			user.set(authSession?.user ?? null)
			session.set(authSession)
			
			// Load profile when user changes
			if (authSession?.user) {
				try {
					const { data, error } = await supabase
						.from('profiles')
						.select('*')
						.eq('id', authSession.user.id)
						.single()
					
					if (error) {
						logger.debug('Profile query error', error)
						profile.set(null)
					} else {
						profile.set(data)
					}
				} catch (error) {
					logger.debug('Failed to load profile', error)
					profile.set(null)
				}
			} else {
				profile.set(null)
			}
		})

		return () => subscription.unsubscribe()
	}
}