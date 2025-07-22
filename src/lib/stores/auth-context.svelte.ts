import { getContext, setContext } from 'svelte'
import type { User, Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/types/database'
import { goto } from '$app/navigation'
import { browser } from '$app/environment'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
	user: User | null
	session: Session | null
	profile: Profile | null
	loading: boolean
	error: Error | null
}

class AuthContext {
	private supabase: SupabaseClient<Database>
	
	// State
	user = $state<User | null>(null)
	session = $state<Session | null>(null)
	profile = $state<Profile | null>(null)
	loading = $state(false)
	error = $state<Error | null>(null)
	
	constructor(supabase: SupabaseClient<Database>, initialUser: User | null, initialSession: Session | null) {
		this.supabase = supabase
		this.user = initialUser
		this.session = initialSession
		
		if (initialUser) {
			this.loadProfile(initialUser.id)
		}
	}
	
	// Notify compatibility layer of state changes
	private notifyStateChange() {
		if (browser) {
			// Dynamic import to avoid circular dependency
			import('./auth-compat').then(module => {
				module.notifyAuthStateChange(this.user, this.session, this.profile, this.loading)
			}).catch(() => {
				// Ignore if compatibility layer not available
			})
		}
	}
	
	private async loadProfile(userId: string) {
		try {
			const { data, error } = await this.supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single()
			
			if (error) throw error
			this.profile = data
			this.notifyStateChange()
		} catch (error) {
			console.error('Error loading profile:', error)
			this.profile = null
			this.notifyStateChange()
		}
	}
	
	// Auth methods
	async signUp(email: string, password: string, username: string, fullName?: string, metadata?: Record<string, any>) {
		this.loading = true
		this.error = null
		this.notifyStateChange()
		
		try {
			const { data, error } = await this.supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						username,
						full_name: fullName,
						...metadata
					},
					emailRedirectTo: `${window.location.origin}/onboarding?new=true`
				}
			})
			
			if (error) throw error
			
			// Update local state
			if (data.user) {
				this.user = data.user
				this.session = data.session
				
				// Send custom confirmation email via Resend
				if (browser && !data.session) { // No session means email confirmation is required
					try {
						const response = await fetch('/api/auth/send-confirmation', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ 
								email: data.user.email,
								userId: data.user.id 
							})
						})
						
						if (!response.ok) {
							console.error('Failed to send confirmation email via Resend');
						}
					} catch (err) {
						console.error('Error sending confirmation email:', err);
					}
				}
			}
			
			return data
		} catch (error) {
			this.error = error instanceof Error ? error : new Error('Sign up failed')
			throw error
		} finally {
			this.loading = false
			this.notifyStateChange()
		}
	}
	
	async signIn(email: string, password: string, rememberMe: boolean = false) {
		this.loading = true
		this.error = null
		this.notifyStateChange()
		
		try {
			// Check rate limit before attempting login
			const { data: rateLimitCheck } = await this.supabase.rpc('check_auth_rate_limit', {
				p_identifier: email,
				p_action: 'login',
				p_max_attempts: 5,
				p_window_minutes: 15,
				p_block_minutes: 30
			})
			
			if (rateLimitCheck && !rateLimitCheck.allowed) {
				const errorMessage = rateLimitCheck.reason === 'blocked' 
					? `Too many login attempts. Please try again in ${Math.ceil(rateLimitCheck.retry_after / 60)} minutes.`
					: `Too many login attempts. Please try again later.`
				throw new Error(errorMessage)
			}
			
			const { data, error } = await this.supabase.auth.signInWithPassword({
				email,
				password
			})
			
			if (error) {
				// Log failed login attempt
				await this.supabase.rpc('log_auth_event', {
					p_user_id: null,
					p_action: 'login_failed',
					p_success: false,
					p_error_message: error.message,
					p_metadata: { email }
				}).catch(console.error)
				
				throw error
			}
			
			// Update local state
			if (data.user && data.session) {
				this.user = data.user
				this.session = data.session
				await this.loadProfile(data.user.id)
				
				// Log successful login
				await this.supabase.rpc('log_auth_event', {
					p_user_id: data.user.id,
					p_action: 'login',
					p_success: true
				}).catch(console.error)
				
				// Store remember me preference
				if (browser && rememberMe) {
					// Store that user wants to be remembered
					localStorage.setItem('remember_me', 'true')
				}
			}
			
			return data
		} catch (error) {
			this.error = error instanceof Error ? error : new Error('Sign in failed')
			throw error
		} finally {
			this.loading = false
			this.notifyStateChange()
		}
	}
	
	async signInWithProvider(provider: 'google' | 'github' | 'apple') {
		this.loading = true
		this.error = null
		
		try {
			const { data, error } = await this.supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/callback`
				}
			})
			
			if (error) throw error
			return data
		} catch (error) {
			this.error = error instanceof Error ? error : new Error('OAuth sign in failed')
			throw error
		} finally {
			this.loading = false
		}
	}
	
	async signOut() {
		this.loading = true
		this.error = null
		this.notifyStateChange()
		
		try {
			const { error } = await this.supabase.auth.signOut()
			if (error) throw error
			
			// Clear local state
			this.user = null
			this.session = null
			this.profile = null
			
			// Redirect to home
			await goto('/')
		} catch (error) {
			this.error = error instanceof Error ? error : new Error('Sign out failed')
			throw error
		} finally {
			this.loading = false
			this.notifyStateChange()
		}
	}
	
	async resetPassword(email: string) {
		this.loading = true
		this.error = null
		
		try {
			const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`
			})
			
			if (error) throw error
			return data
		} catch (error) {
			this.error = error instanceof Error ? error : new Error('Password reset failed')
			throw error
		} finally {
			this.loading = false
		}
	}
	
	async updatePassword(password: string) {
		this.loading = true
		this.error = null
		
		try {
			const { data, error } = await this.supabase.auth.updateUser({
				password
			})
			
			if (error) throw error
			
			// Update local state
			if (data.user) {
				this.user = data.user
			}
			
			return data
		} catch (error) {
			this.error = error instanceof Error ? error : new Error('Password update failed')
			throw error
		} finally {
			this.loading = false
		}
	}
	
	async updateProfile(updates: Partial<Profile>) {
		this.loading = true
		this.error = null
		this.notifyStateChange()
		
		try {
			if (!this.user) throw new Error('User not authenticated')
			
			const { data, error } = await this.supabase
				.from('profiles')
				.update(updates)
				.eq('id', this.user.id)
				.select()
				.single()
			
			if (error) throw error
			this.profile = data
			return data
		} catch (error) {
			this.error = error instanceof Error ? error : new Error('Profile update failed')
			throw error
		} finally {
			this.loading = false
			this.notifyStateChange()
		}
	}
}

const AUTH_CONTEXT_KEY = Symbol('auth')

let globalAuthContext: AuthContext | null = null

export function setAuthContext(supabase: SupabaseClient<Database>, user: User | null, session: Session | null) {
	const context = new AuthContext(supabase, user, session)
	globalAuthContext = context
	return setContext(AUTH_CONTEXT_KEY, context)
}

export function getAuthContext() {
	// Try to get from Svelte context first
	try {
		const context = getContext<AuthContext>(AUTH_CONTEXT_KEY)
		if (context) return context
	} catch (e) {
		// Context not available (e.g., called outside component)
	}
	
	// Fall back to global context
	return globalAuthContext
}