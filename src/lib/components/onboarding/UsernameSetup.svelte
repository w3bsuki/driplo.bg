<script lang="ts">
	import { getAuthContext } from '$lib/stores/auth-context.svelte';
	import { AtSign, Check, X, Loader2, User, Sparkles } from 'lucide-svelte';
	import { onboardingValidators } from '$lib/schemas/onboarding';
	import { fly, fade } from 'svelte/transition';

	interface Props {
		username: string;
	}

	let { username = $bindable('') }: Props = $props();

	const auth = getAuthContext();
	
	let isChecking = $state(false);
	let isAvailable = $state(false);
	let checkError = $state<string | null>(null);
	let debounceTimeout: NodeJS.Timeout;

	// Username suggestions based on the user's email or profile
	const usernameSuggestions = $derived(() => {
		if (!auth.user?.email) return [];
		
		const emailPrefix = auth.user.email.split('@')[0];
		const baseUsername = emailPrefix.replace(/[^a-zA-Z0-9]/g, '');
		
		return [
			baseUsername,
			`${baseUsername}style`,
			`${baseUsername}fashion`,
			`${baseUsername}_`,
			`the${baseUsername}`,
			`${baseUsername}2024`
		].filter(suggestion => suggestion.length >= 3 && suggestion.length <= 20);
	});

	async function checkUsernameAvailability(usernameToCheck: string) {
		if (!usernameToCheck || usernameToCheck.length < 3) {
			isAvailable = false;
			checkError = null;
			return;
		}

		// Basic validation first
		const validationError = onboardingValidators.username(usernameToCheck);
		if (validationError) {
			checkError = validationError;
			isAvailable = false;
			return;
		}

		isChecking = true;
		checkError = null;

		try {
			const { data, error } = await auth.supabase
				.from('profiles')
				.select('id')
				.eq('username', usernameToCheck.toLowerCase());

			if (error) {
				// Error checking
				isAvailable = false;
				checkError = 'Unable to check username availability';
			} else if (!data || data.length === 0) {
				// No user found - username is available
				isAvailable = true;
				checkError = null;
			} else {
				// User found - username is taken
				isAvailable = false;
				checkError = 'This username is already taken';
			}
		} catch (error) {
			isAvailable = false;
			checkError = 'Network error checking username';
		} finally {
			isChecking = false;
		}
	}

	function handleUsernameInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;
		username = value;
		isAvailable = false;
		checkError = null;
		
		// Debounce the availability check
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			checkUsernameAvailability(value);
		}, 500);
	}

	function selectSuggestedUsername(suggestion: string) {
		username = suggestion;
		checkUsernameAvailability(suggestion);
	}

	// Initial check if username is already provided
	$effect(() => {
		if (username) {
			checkUsernameAvailability(username);
		}
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="text-center mb-8">
		<h2 class="text-2xl font-bold text-gray-900 mb-3">
			Choose Your Username
		</h2>
		<p class="text-lg text-gray-600 max-w-2xl mx-auto">
			Your username is how others will find you on Driplo. Choose something unique and memorable.
		</p>
	</div>

	<!-- Username Input -->
	<div class="max-w-md mx-auto space-y-4">
		<div class="relative">
			<label for="username" class="block text-sm font-medium text-gray-700 mb-2">
				<div class="flex items-center gap-2">
					<AtSign class="w-4 h-4" />
					Username
				</div>
			</label>
			<div class="relative">
				<input
					id="username"
					type="text"
					bind:value={username}
					oninput={handleUsernameInput}
					placeholder="your_unique_username"
					maxlength="20"
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
						focus:ring-blue-500 focus:border-transparent transition-all duration-200
						placeholder-gray-400 pr-12
						{checkError ? 'border-red-500 focus:ring-red-500' : ''}
						{isAvailable ? 'border-green-500 focus:ring-green-500' : ''}"
				/>
				
				<!-- Status indicator -->
				<div class="absolute right-3 top-1/2 -translate-y-1/2">
					{#if isChecking}
						<Loader2 class="w-4 h-4 text-blue-500 animate-spin" />
					{:else if username.length >= 3}
						{#if isAvailable}
							<div class="flex items-center gap-1 text-green-600" transition:fade>
								<Check class="w-4 h-4" />
								<span class="text-xs font-medium">Available</span>
							</div>
						{:else if checkError}
							<div class="flex items-center gap-1 text-red-600" transition:fade>
								<X class="w-4 h-4" />
								<span class="text-xs font-medium">Taken</span>
							</div>
						{/if}
					{/if}
				</div>
			</div>
			
			{#if checkError}
				<p class="mt-1 text-sm text-red-600">{checkError}</p>
			{/if}
			
			<p class="mt-1 text-xs text-gray-500">
				Must be 3-20 characters, letters, numbers, and underscores only
			</p>
		</div>

		<!-- Username suggestions -->
		{#if usernameSuggestions.length > 0 && !isAvailable}
			<div 
				class="bg-blue-50 border border-blue-200 rounded-lg p-4"
				transition:fly={{ y: 10, duration: 300 }}
			>
				<div class="flex items-center gap-2 mb-3">
					<Sparkles class="w-4 h-4 text-blue-600" />
					<span class="text-sm font-medium text-blue-600">Suggested usernames:</span>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each usernameSuggestions as suggestion}
						<button
							type="button"
							onclick={() => selectSuggestedUsername(suggestion)}
							class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-full 
								hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200
								text-gray-700 hover:text-blue-700 flex items-center gap-1"
						>
							<AtSign class="w-3 h-3" />
							{suggestion}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Username rules -->
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
			<div class="flex gap-3">
				<User class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
				<div>
					<h3 class="font-medium text-blue-900 mb-2">Username Guidelines:</h3>
					<ul class="space-y-1 text-sm text-blue-800">
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
							<span>Must be between 3-20 characters</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
							<span>Can contain letters, numbers, and underscores</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
							<span>Cannot be changed after account creation</span>
						</li>
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
							<span>Will be part of your profile URL: driplo.bg/@{username || 'username'}</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Preview -->
	{#if username && isAvailable}
		<div 
			class="max-w-md mx-auto p-4 bg-green-50 border border-green-200 rounded-lg"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<div class="flex items-center gap-2 mb-2">
				<Check class="w-4 h-4 text-green-600" />
				<span class="text-sm font-medium text-green-600">Username Available!</span>
			</div>
			<p class="text-sm text-gray-600">
				Your profile URL will be: <span class="font-mono font-medium">driplo.bg/@{username}</span>
			</p>
		</div>
	{/if}
</div>