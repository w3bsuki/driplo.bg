<script lang="ts">
	import { ErrorBoundary } from '$lib/components/shared';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		/**
		 * Whether to redirect to login on auth errors
		 */
		redirectToLogin?: boolean;
		
		/**
		 * Custom redirect path after auth error
		 */
		redirectPath?: string;
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
		
		/**
		 * Children to render
		 */
		children?: any;
	}
	
	interface AuthError {
		code?: string;
		message?: string;
		status?: number;
	}

	let { 
		redirectToLogin = true,
		redirectPath,
		class: className,
		children
	}: Props = $props();

	let authError = $state<AuthError | null>(null);

	function handleAuthError() {
		// Clear auth error and redirect
		authError = null;
		
		if (redirectToLogin) {
			const returnUrl = encodeURIComponent($page.url.pathname + $page.url.search);
			goto(redirectPath || `/login?returnUrl=${returnUrl}`, { replaceState: true });
		}
	}

	function isAuthError(error: unknown): error is AuthError {
		const authErrorCodes = [
			'auth/invalid-credentials',
			'auth/user-not-found',
			'auth/requires-recent-login',
			'auth/session-expired',
			'PGRST301', // JWT expired
			'permission-denied'
		];

		if (typeof error !== 'object' || error === null) return false;
		
		const typedError = error as Partial<AuthError>;
		
		return authErrorCodes.some(code => 
			typedError.code === code || 
			typedError.message?.includes(code) ||
			typedError.status === 401 ||
			typedError.status === 403
		);
	}

	// Custom reset function for auth errors
	function resetAuthBoundary() {
		if (authError && isAuthError(authError)) {
			handleAuthError();
		} else {
			// For non-auth errors, just clear and retry
			authError = null;
		}
	}

	// Catch any errors from children and check if they're auth-related
	function handleError(error: unknown) {
		if (isAuthError(error)) {
			authError = error;
		} else {
			// Re-throw non-auth errors
			throw error;
		}
	}
</script>

<ErrorBoundary 
	error={authError}
	reset={resetAuthBoundary}
	variant="inline"
	title="Authentication Required"
	showHome={false}
	autoRetry={false}
	class={className}
>
	{@render children?.()}
</ErrorBoundary>

<!-- Provide helpful messaging for auth errors -->
{#if authError && isAuthError(authError)}
	<div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-sm">
		<div class="text-sm text-amber-800">
			<p class="font-medium">Authentication required</p>
			<p class="mt-1">Please log in to continue accessing this content.</p>
			
			{#if redirectToLogin}
				<button 
					onclick={handleAuthError}
					class="mt-2 text-amber-700 underline hover:text-amber-900 text-sm font-medium"
				>
					Go to login page
				</button>
			{/if}
		</div>
	</div>
{/if}