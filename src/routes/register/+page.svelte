<script lang="ts">
	import { enhance } from '$app/forms'
	import { Eye, EyeOff, Github, CheckCircle, Store, User } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import { cn } from '$lib/utils'
	import type { PageData, ActionData } from './$types'
	import Spinner from '$lib/components/ui/Spinner.svelte'
	import { onMount } from 'svelte'

	let { data, form }: { data: PageData, form: ActionData } = $props()
	
	// Form state
	let email = $state(form?.email || '')
	let password = $state('')
	let confirmPassword = $state('')
	let showPassword = $state(false)
	let showConfirmPassword = $state(false)
	let loading = $state(false)
	let oauthLoading = $state(false)
	let agreedToTerms = $state(false)
	let accountType = $state<'personal' | 'brand'>(form?.accountType || 'personal')
	let emailCheckLoading = $state(false)
	let emailCheckResult = $state<'available' | 'taken' | null>(null)
	let hasSubmitted = $state(false)
	
	// Brand-specific fields
	let brandName = $state(form?.brandName || '')
	let brandCategory = $state(form?.brandCategory || '')
	let brandWebsite = $state(form?.brandWebsite || '')
	
	// Debounced email availability check
	let emailCheckTimeout: ReturnType<typeof setTimeout> | null = null;
	
	function checkEmailAvailability(emailValue: string) {
		if (!emailValue || !emailValue.includes('@')) {
			emailCheckResult = null;
			return;
		}
		
		// Clear previous timeout
		if (emailCheckTimeout) {
			clearTimeout(emailCheckTimeout);
		}
		
		// Set loading state
		emailCheckLoading = true;
		emailCheckResult = null;
		
		// Debounce the check by 500ms
		emailCheckTimeout = setTimeout(async () => {
			try {
				const response = await fetch('/api/auth/check-email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email: emailValue })
				});
				
				const result = await response.json();
				
				if (response.ok) {
					emailCheckResult = result.available ? 'available' : 'taken';
				} else {
					emailCheckResult = null;
				}
			} catch (error) {
				// Email check failed - handled by UI state
				emailCheckResult = null;
			} finally {
				emailCheckLoading = false;
			}
		}, 500);
	}
	
	// Watch email changes for availability check
	$effect(() => {
		if (email && email.length > 0) {
			checkEmailAvailability(email);
		} else {
			emailCheckResult = null;
			emailCheckLoading = false;
		}
	});
	
	// Show error messages from form submission
	onMount(() => {
		if (form?.error) {
			toast.error(form.error)
		}
	})
</script>

<svelte:head>
	<title>Sign Up | Driplo</title>
	<meta name="description" content="Create your Driplo account - Personal or Brand" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
	<div class="w-full max-w-md">
		{#if data.success}
			<!-- Success message after signup -->
			<div class="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm">
				<div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
					<CheckCircle class="w-8 h-8 text-green-600" />
				</div>
				<h2 class="text-xl font-bold text-gray-900 mb-2">Check your email!</h2>
				<p class="text-gray-600 text-sm mb-4">
					We've sent a verification link to your email address. 
					Click the link to activate your account and get started.
				</p>
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
					<p class="text-sm text-blue-700">
						<strong>Tip:</strong> If you don't see the email, check your spam folder.
					</p>
				</div>
				<a href="/login" class="text-blue-400 hover:text-blue-500 font-medium">
					Return to login
				</a>
			</div>
		{:else}
			<div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
				<!-- Logo -->
				<div class="text-center mb-6">
					<h1 class="text-3xl font-bold text-blue-400">Driplo</h1>
					<p class="text-gray-600 text-sm mt-1">Create your account</p>
				</div>
				
				<!-- Account Type Selection -->
				<div class="mb-6">
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Account Type
					</label>
					<div class="grid grid-cols-2 gap-3">
						<button
							type="button"
							onclick={() => accountType = 'personal'}
							class={cn(
								"relative p-4 rounded-lg border-2 transition-all duration-200",
								accountType === 'personal' 
									? "border-blue-400 bg-blue-50" 
									: "border-gray-200 hover:border-gray-300"
							)}
						>
							<User class={cn("w-6 h-6 mx-auto mb-2", 
								accountType === 'personal' ? "text-blue-400" : "text-gray-400"
							)} />
							<div class="font-medium text-sm">Personal</div>
							<div class="text-xs text-gray-500 mt-1">Buy & sell fashion</div>
						</button>
						<button
							type="button"
							onclick={() => accountType = 'brand'}
							class={cn(
								"relative p-4 rounded-lg border-2 transition-all duration-200",
								accountType === 'brand' 
									? "border-blue-400 bg-blue-50" 
									: "border-gray-200 hover:border-gray-300"
							)}
						>
							<Store class={cn("w-6 h-6 mx-auto mb-2", 
								accountType === 'brand' ? "text-blue-400" : "text-gray-400"
							)} />
							<div class="font-medium text-sm">Brand</div>
							<div class="text-xs text-gray-500 mt-1">Sell as a business</div>
							<div class="absolute -top-2 -right-2 bg-blue-400 text-white text-xs px-1.5 py-0.5 rounded-full">
								Pro
							</div>
						</button>
					</div>
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
						<input type="hidden" name="accountType" value={accountType} />
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
						<input type="hidden" name="accountType" value={accountType} />
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
						<span class="px-3 bg-white text-gray-500">Or register with email</span>
					</div>
				</div>

				<!-- Registration Form -->
				<form method="POST" action="?/signup" use:enhance={() => {
					// Prevent duplicate submissions
					if (hasSubmitted || loading) {
						return async () => {};
					}
					
					hasSubmitted = true;
					loading = true;
					
					return async ({ result, update }) => {
						await update()
						loading = false
						
						if (result.type === 'failure' && result.data?.['error']) {
							toast.error(result.data['error'] as string)
							// Allow retry on failure
							hasSubmitted = false;
						} else if (result.type === 'success') {
							// Keep submitted state on success to prevent retry
							toast.success('Registration successful! Check your email.')
						}
					}
				}} class="space-y-4">
					<input type="hidden" name="accountType" value={accountType} />
					
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							Email *
						</label>
						<div class="relative">
							<input
								id="email"
								name="email"
								type="email"
								bind:value={email}
								placeholder="your@email.com"
								required
								disabled={loading}
								class={cn(
									"w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 bg-white placeholder:text-gray-400",
									emailCheckResult === 'taken' ? "border-red-300" : "border-gray-300"
								)}
							/>
							{#if emailCheckLoading}
								<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
									<div class="w-4 h-4 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
								</div>
							{:else if emailCheckResult === 'available'}
								<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
									<CheckCircle class="w-4 h-4 text-green-500" />
								</div>
							{:else if emailCheckResult === 'taken'}
								<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
									<div class="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
										<div class="w-2 h-2 bg-white rounded-full"></div>
									</div>
								</div>
							{/if}
						</div>
						{#if emailCheckResult === 'taken'}
							<p class="mt-1 text-sm text-red-600">This email is already registered. <a href="/login" class="text-blue-400 hover:text-blue-500">Sign in instead?</a></p>
						{/if}
					</div>

					{#if accountType === 'brand'}
						<div class="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
							<div>
								<label for="brandName" class="block text-sm font-medium text-gray-700 mb-1">
									Brand Name *
								</label>
								<input
									id="brandName"
									name="brandName"
									type="text"
									bind:value={brandName}
									placeholder="Your brand name"
									required
									disabled={loading}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 bg-white placeholder:text-gray-400"
								/>
							</div>
							<div>
								<label for="brandCategory" class="block text-sm font-medium text-gray-700 mb-1">
									Brand Category
								</label>
								<select
									id="brandCategory"
									name="brandCategory"
									bind:value={brandCategory}
									disabled={loading}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 bg-white placeholder:text-gray-400"
								>
									<option value="">Select category</option>
									<option value="fashion">Fashion & Apparel</option>
									<option value="accessories">Accessories</option>
									<option value="footwear">Footwear</option>
									<option value="jewelry">Jewelry</option>
									<option value="bags">Bags & Luggage</option>
									<option value="beauty">Beauty & Cosmetics</option>
									<option value="vintage">Vintage & Thrift</option>
									<option value="handmade">Handmade & Artisan</option>
									<option value="sustainable">Sustainable Fashion</option>
									<option value="other">Other</option>
								</select>
							</div>
							<div>
								<label for="brandWebsite" class="block text-sm font-medium text-gray-700 mb-1">
									Website (optional)
								</label>
								<input
									id="brandWebsite"
									name="brandWebsite"
									type="url"
									bind:value={brandWebsite}
									placeholder="https://yourbrand.com"
									disabled={loading}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 bg-white placeholder:text-gray-400"
								/>
							</div>
							<p class="text-xs text-blue-700">
								You'll need to verify your brand after registration to access all features.
							</p>
						</div>
					{/if}

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
							Password *
						</label>
						<div class="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="Min 8 characters"
								required
								disabled={loading}
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

					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
							Confirm password *
						</label>
						<div class="relative">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								bind:value={confirmPassword}
								placeholder="Confirm password"
								required
								disabled={loading}
								class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 bg-white placeholder:text-gray-400"
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
							name="agreedToTerms"
							bind:checked={agreedToTerms}
							class="mt-0.5 rounded border-gray-300 text-blue-400 focus:ring-2 focus:ring-blue-400"
							required
						/>
						<label for="terms" class="ml-2 text-sm text-gray-600">
							I agree to the
							<a href="/terms" class="text-blue-400 hover:text-blue-500">Terms of Service</a>
							and
							<a href="/privacy" class="text-blue-400 hover:text-blue-500">Privacy Policy</a>
						</label>
					</div>

					<button 
						type="submit" 
						class="w-full py-2.5 bg-blue-400 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						disabled={loading || oauthLoading || !agreedToTerms || emailCheckResult === 'taken' || emailCheckLoading || hasSubmitted}
					>
						{#if loading}
							<Spinner size="sm" color="white" />
						{:else}
							Sign up {accountType === 'brand' ? 'as Brand' : ''}
						{/if}
					</button>
				</form>

				<!-- Sign in link -->
				<p class="text-center text-sm text-gray-600 mt-6">
					Already have an account?
					<a href="/login" class="text-blue-400 hover:text-blue-500 font-medium">
						Sign in
					</a>
				</p>
			</div>
		{/if}
	</div>
</div>