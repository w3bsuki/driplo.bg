<script lang="ts">
	import { enhance } from '$app/forms'
	import { Eye, EyeOff, Github } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import type { PageData, ActionData } from './$types'
	import Spinner from '$lib/components/ui/Spinner.svelte'
	import TurnstileWrapper from '$lib/components/auth/TurnstileWrapper.svelte'
	import { onMount } from 'svelte'

	let { data, form }: { data: PageData, form: ActionData } = $props()
	
	let email = $state(form?.email || '')
	let password = $state('')
	let showPassword = $state(false)
	let rememberMe = $state(false)
	let loading = $state(false)
	let oauthLoading = $state(false)
	let captchaToken = $state('')
	let captchaWrapper: TurnstileWrapper

	// Show error messages based on URL parameters or form errors
	onMount(() => {
		// URL param errors (from redirects)
		if (data.error) {
			switch (data.error) {
				case 'verification_expired':
					toast.error('Your verification link has expired. Please sign up again.')
					break
				case 'invalid_token':
					toast.error('Invalid verification link. Please try signing up again.')
					break
				case 'verification_failed':
					toast.error('Email verification failed. Please try again.')
					break
				case 'missing_token':
					toast.error('Invalid verification link.')
					break
				case 'auth_callback_error':
					toast.error('Authentication failed. Please try again.')
					break
				case 'session_expired':
					toast.error('Your session has expired. Please log in again.')
					break
				case 'unauthorized':
					toast.error('Please log in to access that page.')
					break
				default:
					toast.error('An error occurred. Please try again.')
			}
		}
		
		// URL param messages (success messages)
		if (data.message) {
			switch (data.message) {
				case 'logged_out':
					toast.success('You have been successfully logged out.')
					break
				case 'email_verified':
					toast.success('Your email has been verified. You can now log in.')
					break
			}
		}
		
		// Form submission errors
		if (form?.error) {
			toast.error(form.error)
		}
	})
</script>

<svelte:head>
	<title>Sign In | Driplo</title>
	<meta name="description" content="Sign in to your Driplo account" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-md">
		<div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
			<!-- Logo -->
			<div class="text-center mb-6">
				<h1 class="text-3xl font-bold text-blue-400">Driplo</h1>
				<p class="text-gray-600 text-sm mt-1">Welcome back</p>
			</div>
			
			<!-- OAuth Buttons -->
			<div class="space-y-3 mb-6">
				<form method="POST" action="?/oauth" use:enhance={() => {
					oauthLoading = true
					return async ({ update }) => {
						await update()
						oauthLoading = false
					}
				}}>
					<input type="hidden" name="provider" value="google" />
					<button
						type="submit"
						class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
						disabled={loading || oauthLoading}
					>
						<svg class="w-5 h-5 google-logo" viewBox="0 0 24 24">
							<path class="google-blue" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path class="google-green" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path class="google-yellow" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path class="google-red" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						Continue with Google
					</button>
				</form>
				
				<form method="POST" action="?/oauth" use:enhance={() => {
					oauthLoading = true
					return async ({ update }) => {
						await update()
						oauthLoading = false
					}
				}}>
					<input type="hidden" name="provider" value="github" />
					<button
						type="submit"
						class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
						disabled={loading || oauthLoading}
					>
						<Github class="w-5 h-5" />
						Continue with GitHub
					</button>
				</form>
			</div>

			<!-- Divider -->
			<div class="relative mb-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-200"></div>
				</div>
				<div class="relative flex justify-center text-xs">
					<span class="px-3 bg-white text-gray-500">Or sign in with email</span>
				</div>
			</div>

			<!-- Login Form -->
			<form method="POST" action="?/signin" use:enhance={() => {
				loading = true
				return async ({ result, update }) => {
					if (result.type === 'redirect') {
						// Successful login - invalidate auth data before redirect
						await import('$app/navigation').then(nav => {
							nav.invalidate('app:auth')
							nav.invalidate('supabase:auth')
						})
					}
					
					await update()
					loading = false
					
					if (result.type === 'failure' && result.data?.['error']) {
						toast.error(result.data['error'] as string)
						// Reset CAPTCHA on error
						if (captchaWrapper && typeof captchaWrapper === 'object' && 'reset' in captchaWrapper && typeof captchaWrapper.reset === 'function') {
							captchaWrapper.reset()
							captchaToken = ''
						}
					}
				}
			}} class="space-y-4">
				<input type="hidden" name="captcha_token" value={captchaToken} />
				
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						bind:value={email}
						placeholder="your@email.com"
						required
						disabled={loading}
						autocomplete="email"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 bg-white placeholder:text-gray-400"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Password
					</label>
					<div class="relative">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="Enter your password"
							required
							disabled={loading}
							autocomplete="current-password"
							class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 bg-white placeholder:text-gray-400"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							onclick={() => showPassword = !showPassword}
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4 text-gray-400" />
							{:else}
								<Eye class="h-4 w-4 text-gray-400" />
							{/if}
						</button>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<label class="flex items-center">
						<input 
							type="checkbox"
							name="rememberMe"
							bind:checked={rememberMe}
							class="rounded border-gray-300 text-blue-400 focus:ring-blue-400" 
						/>
						<span class="ml-2 text-sm text-gray-600">Remember me</span>
					</label>
					<a href="/forgot-password" class="text-sm text-blue-400 hover:text-blue-500">
						Forgot password?
					</a>
				</div>

				<!-- CAPTCHA -->
				<div class="flex justify-center">
					<TurnstileWrapper 
						bind:this={captchaWrapper}
						onVerify={(token) => captchaToken = token}
						onExpire={() => captchaToken = ''}
						onError={() => captchaToken = ''}
					/>
				</div>

				<button 
					type="submit" 
					class="w-full py-2.5 bg-blue-400 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
					disabled={loading || oauthLoading}
				>
					{#if loading}
						<Spinner size="sm" color="white" />
					{:else}
						Sign in
					{/if}
				</button>
			</form>

			<!-- Sign up link -->
			<p class="text-center text-sm text-gray-600 mt-6">
				Don't have an account?
				<a href="/register" class="text-blue-400 hover:text-blue-500 font-medium">
					Sign up
				</a>
			</p>

			<!-- Resend verification link -->
			{#if form && 'showResend' in form && form.showResend}
				<p class="text-center text-sm text-gray-600 mt-2">
					<a href="/resend-verification" class="text-blue-400 hover:text-blue-500 font-medium">
						Resend verification email
					</a>
				</p>
			{/if}
		</div>
	</div>
</div>