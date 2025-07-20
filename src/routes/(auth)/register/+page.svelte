<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { auth } from '$lib/stores/auth'
	import { Eye, EyeOff, Github, CheckCircle } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import { z } from 'zod'
	import * as m from '$lib/paraglide/messages.js'
	import Spinner from '$lib/components/ui/Spinner.svelte'

	let email = $state('')
	let password = $state('')
	let confirmPassword = $state('')
	let username = $state('')
	let fullName = $state('')
	let showPassword = $state(false)
	let showConfirmPassword = $state(false)
	let loading = $state(false)
	let agreedToTerms = $state(false)
	
	// Check if showing success message
	let showSuccess = $derived($page.url.searchParams.get('success') === 'true')

	const registerSchema = z.object({
		email: z.string().email('Please enter a valid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string(),
		username: z.string()
			.min(3, 'Username must be at least 3 characters')
			.max(30, 'Username must be less than 30 characters')
			.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
		fullName: z.string().optional(),
		agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms of service')
	}).refine(data => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"]
	})

	async function handleRegister() {
		console.log('handleRegister called!', { email, password, username, agreedToTerms })
		try {
			const validatedData = registerSchema.parse({
				email,
				password,
				confirmPassword,
				username,
				fullName: fullName || undefined,
				agreedToTerms
			})

			loading = true
			await auth.signUp(email, password, username, fullName || undefined)
			// Show success message and redirect to a confirmation page
			toast.success('Account created! Please check your email to verify your account.')
			// Stay on the page or redirect to a confirmation page
			goto('/register?success=true')
		} catch (error: any) {
			if (error.issues) {
				// Zod validation errors
				error.issues.forEach((issue: any) => {
					toast.error(issue.message)
				})
			} else {
				toast.error(error.message || 'Registration failed')
			}
		} finally {
			loading = false
		}
	}

	async function handleOAuth(provider: 'google' | 'github') {
		loading = true
		try {
			await auth.signInWithProvider(provider)
		} catch (error: any) {
			toast.error(error.message || 'OAuth registration failed')
			loading = false
		}
	}
</script>

<svelte:head>
	<title>Sign Up | Driplo</title>
	<meta name="description" content="Create your Driplo account" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-4">
	<div class="w-full max-w-md">
		{#if showSuccess}
			<!-- Success message after signup -->
			<div class="bg-white rounded-xl shadow-lg p-8 text-center">
				<div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
					<CheckCircle class="w-8 h-8 text-green-600" />
				</div>
				<h2 class="text-2xl font-bold text-gray-900 mb-2">Check your email!</h2>
				<p class="text-gray-600 mb-6">
					We've sent a verification link to your email address. 
					Click the link to activate your account and get started.
				</p>
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
					<p class="text-sm text-blue-700">
						<strong>Tip:</strong> If you don't see the email, check your spam folder or wait a few minutes.
					</p>
				</div>
				<a href="/login" class="text-blue-400 hover:text-blue-500 font-medium">
					Return to login
				</a>
			</div>
		{:else}
		<div class="bg-white rounded-xl shadow-lg p-6">
			<!-- Logo -->
			<div class="text-center mb-4">
				<h1 class="text-3xl font-bold text-blue-400">Driplo</h1>
				<p class="text-gray-600 text-sm mt-1">Create your account</p>
			</div>
			
			<!-- OAuth Buttons -->
			<div class="space-y-2 mb-4">
				<button
					class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
					onclick={() => handleOAuth('google')}
					disabled={loading}
				>
					<svg class="w-4 h-4" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					Continue with Google
				</button>
				<button
					class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
					onclick={() => handleOAuth('github')}
					disabled={loading}
				>
					<Github class="w-4 h-4" />
					Continue with GitHub
				</button>
			</div>

			<!-- Divider -->
			<div class="relative mb-4">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-200"></div>
				</div>
				<div class="relative flex justify-center text-xs">
					<span class="px-3 bg-white text-gray-500">Or</span>
				</div>
			</div>

			<!-- Registration Form -->
			<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="space-y-3">
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="fullName" class="block text-xs font-medium text-gray-700 mb-1">
							Full name
						</label>
						<input
							id="fullName"
							type="text"
							bind:value={fullName}
							placeholder="John Doe"
							disabled={loading}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
						/>
					</div>
					<div>
						<label for="username" class="block text-xs font-medium text-gray-700 mb-1">
							Username *
						</label>
						<input
							id="username"
							type="text"
							bind:value={username}
							placeholder="johndoe"
							required
							disabled={loading}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
						/>
					</div>
				</div>

				<div>
					<label for="email" class="block text-xs font-medium text-gray-700 mb-1">
						Email *
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="Enter your email"
						required
						disabled={loading}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
					/>
				</div>

				<div>
					<label for="password" class="block text-xs font-medium text-gray-700 mb-1">
						Password *
					</label>
					<div class="relative">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="Min 8 characters"
							required
							disabled={loading}
							class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
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

				<div>
					<label for="confirmPassword" class="block text-xs font-medium text-gray-700 mb-1">
						Confirm password *
					</label>
					<div class="relative">
						<input
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							placeholder="Confirm password"
							required
							disabled={loading}
							class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							onclick={() => showConfirmPassword = !showConfirmPassword}
						>
							{#if showConfirmPassword}
								<EyeOff class="h-4 w-4 text-gray-400" />
							{:else}
								<Eye class="h-4 w-4 text-gray-400" />
							{/if}
						</button>
					</div>
				</div>

				<div class="flex items-start">
					<input
						type="checkbox"
						id="terms"
						bind:checked={agreedToTerms}
						class="mt-0.5 rounded border-gray-300 text-blue-400 focus:ring-2 focus:ring-blue-300"
						required
					/>
					<label for="terms" class="ml-2 text-xs text-gray-600">
						I agree to the
						<a href="/terms" class="text-blue-400 hover:text-blue-500">Terms of Service</a>
						and
						<a href="/privacy" class="text-blue-400 hover:text-blue-500">Privacy Policy</a>
					</label>
				</div>

				<button 
					type="submit" 
					class="w-full py-2.5 bg-blue-400 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
					disabled={loading || !agreedToTerms}
				>
					{#if loading}
						<Spinner size="sm" color="white" />
					{:else}
						Sign up
					{/if}
				</button>
			</form>
			

			<!-- Sign in link -->
			<p class="text-center text-sm text-gray-600 mt-4">
				Already have an account?
				<a href="/login" class="text-blue-400 hover:text-blue-500 font-medium">
					Sign in
				</a>
			</p>
		</div>
		{/if}
	</div>
</div>