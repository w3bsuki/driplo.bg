import { getContext, setContext } from 'svelte'
import type { User, Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/types/database.types'
import { goto, invalidateAll } from '$app/navigation'
import { browser } from '$app/environment'

type Profile = Database['public']['Tables']['profiles']['Row']

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
	
	async loadProfile(userId: string) {
		console.log('🔄 Starting profile load for:', userId);
		try {
			// Add timeout to prevent infinite hang
			const timeoutPromise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Profile load timeout after 5s')), 5000)
			);
			
			console.log('📡 Querying profiles table...');
			const queryPromise = this.supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single();
			
			const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any
			
			if (error) {
				console.error('❌ Profile load error:', error);
				throw error;
			}
			console.log('✅ Profile loaded:', data?.username || 'no username');
			this.profile = data
			this.notifyStateChange()
			return data
		} catch (error) {
			console.error('❌ Error loading profile:', error)
			this.profile = null
			this.notifyStateChange()
			return null
		}
	}
	
	// Auth methods - These are primarily for client-side use
	// Server-side auth is handled through form actions in +page.server.ts files
	async signUp(email: string, password: string, username?: string, fullName?: string, metadata?: Record<string, any>) {
		// This method is kept for compatibility but auth should be handled server-side
		console.warn('Client-side signUp called. Consider using server-side form actions instead.')
		this.loading = true
		this.error = null
		this.notifyStateChange()
		
		try {
			// Extract captcha token from metadata if present
			const { captcha_token, ...userMetadata } = metadata || {}
			
			const signUpData: any = {
				email,
				password,
				options: {
					data: {
						...userMetadata
					},
					emailRedirectTo: `${window.location.origin}/auth/callback`,
					...(captcha_token && { captchaToken: captcha_token })
				}
			}
			
			// Only add username and full_name if provided
			if (username) {
				signUpData.options.data.username = username
			}
			if (fullName) {
				signUpData.options.data.full_name = fullName
			}
			
			const { data, error } = await this.supabase.auth.signUp(signUpData)
			
			if (error) {
				// Check for specific error types
				if (error.message?.includes('duplicate key') || 
				    error.message?.includes('already registered') || 
				    error.message?.includes('User already registered') ||
				    error.message?.includes('Database error')) {
					throw new Error('Email already in use! Please login or use a different email.');
				}
				if (error.status === 406) {
					throw new Error('Invalid request. Please check your information and try again.');
				}
				throw error;
			}
			
			// Update local state
			if (data.user) {
				this.user = data.user
				this.session = data.session
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
		// This method is kept for compatibility but auth should be handled server-side
		console.warn('Client-side signIn called. Consider using server-side form actions instead.')
		this.loading = true
		this.error = null
		this.notifyStateChange()
		
		try {
			const { data, error } = await this.supabase.auth.signInWithPassword({
				email,
				password
			})
			
			if (error) {
				throw error
			}
			
			// Update local state
			if (data.user && data.session) {
				this.user = data.user
				this.session = data.session
				await this.loadProfile(data.user.id)
				
				// Store remember me preference
				if (browser && rememberMe) {
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
					redirectTo: `${window.location.origin}/callback`,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent'
					}
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
			// Store user id for logging before clearing
			const userId = this.user?.id
			
			// Clear local state first
			this.user = null
			this.session = null
			this.profile = null
			
			// Clear any browser storage that might persist
			if (browser) {
				// Clear remember me preference
				localStorage.removeItem('remember_me')
				// Clear any pending account type for OAuth
				localStorage.removeItem('pending_account_type')
				
				// Clear all supabase-related items from localStorage
				const keysToRemove: string[] = []
				for (let i = 0; i < localStorage.length; i++) {
					const key = localStorage.key(i)
					if (key && (key.includes('supabase') || key.includes('sb-'))) {
						keysToRemove.push(key)
					}
				}
				keysToRemove.forEach(key => localStorage.removeItem(key))
			}
			
			// Sign out from Supabase with global scope to ensure all sessions are cleared
			const { error } = await this.supabase.auth.signOut({
				scope: 'global' // Changed to global to ensure complete logout
			})
			
			if (error) {
				console.error('Supabase signOut error:', error)
				// Continue with cleanup even if signOut fails
			}
			
			// Log auth event removed - function doesn't exist in database
			
			// Ensure we wait for invalidateAll to complete
			try {
				await invalidateAll()
			} catch (e) {
				console.error('Error invalidating all:', e)
			}
			
			// Add a delay to ensure all async operations complete
			if (browser) {
				await new Promise(resolve => setTimeout(resolve, 200))
			}
			
			// Navigate to login page with success message
			await goto('/login?message=logged_out', { replaceState: true, invalidateAll: false })
		} catch (error) {
			console.error('Error during sign out process:', error)
			this.error = error instanceof Error ? error : new Error('Sign out failed')
			
			// Force navigation even on error
			if (browser) {
				// Invalidate all to refresh server-side session
				await invalidateAll()
				await goto('/login?message=logged_out', { replaceState: true })
			}
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
	
	async refreshSession() {
		try {
			const { data, error } = await this.supabase.auth.refreshSession()
			
			if (error) {
				console.error('Session refresh error:', error)
				// If refresh fails, clear the session
				this.user = null
				this.session = null
				this.profile = null
				this.notifyStateChange()
				throw error
			}
			
			if (data.session) {
				this.session = data.session
				this.user = data.user
				this.notifyStateChange()
			}
			
			return data
		} catch (error) {
			console.error('Failed to refresh session:', error)
			throw error
		}
	}
	
	// Check if session needs refresh (called before API requests)
	async ensureValidSession() {
		if (!this.session) return false
		
		// Check if token is about to expire (within 5 minutes)
		const expiresAt = this.session.expires_at
		if (!expiresAt) return false
		
		const expiresIn = expiresAt - Math.floor(Date.now() / 1000)
		
		// Refresh if less than 5 minutes remaining
		if (expiresIn < 300) {
			try {
				await this.refreshSession()
				return true
			} catch (error) {
				return false
			}
		}
		
		return true
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