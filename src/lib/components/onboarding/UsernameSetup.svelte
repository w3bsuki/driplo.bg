<script lang="ts">
	import { Check, X, Loader2 } from 'lucide-svelte';
	import { onboardingValidators } from '$lib/schemas/onboarding';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { User as AuthUser } from '@supabase/supabase-js';

	interface Props {
		username: string;
		user: AuthUser;
		supabase: SupabaseClient;
	}

	let { username = $bindable(''), user, supabase }: Props = $props();
	
	let isChecking = $state(false);
	let isAvailable = $state(false);
	let checkError = $state<string | null>(null);
	let debounceTimeout: NodeJS.Timeout;

	async function checkUsernameAvailability(usernameToCheck: string) {
		if (!usernameToCheck || usernameToCheck.length < 3) {
			isAvailable = false;
			checkError = null;
			return;
		}

		const validationError = onboardingValidators.username(usernameToCheck);
		if (validationError) {
			checkError = validationError;
			isAvailable = false;
			return;
		}

		isChecking = true;
		checkError = null;

		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('id')
				.eq('username', usernameToCheck.toLowerCase());

			if (error) {
				isAvailable = false;
				checkError = 'Unable to check username';
			} else if (!data || data.length === 0) {
				isAvailable = true;
				checkError = null;
			} else {
				isAvailable = false;
				checkError = 'Username taken';
			}
		} catch (error) {
			isAvailable = false;
			checkError = 'Network error';
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
		
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			checkUsernameAvailability(value);
		}, 500);
	}

	$effect(() => {
		if (username) {
			checkUsernameAvailability(username);
		}
	});
</script>

<div class="space-y-4">
	<div>
		<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
			Username
		</label>
		<div class="relative">
			<input
				id="username"
				type="text"
				bind:value={username}
				oninput={handleUsernameInput}
				placeholder="Enter username"
				maxlength="20"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm
					{checkError ? 'border-red-500 focus:ring-red-500' : ''}
					{isAvailable ? 'border-green-500 focus:ring-green-500' : ''}"
			/>
			
			<div class="absolute right-2 top-1/2 -translate-y-1/2">
				{#if isChecking}
					<Loader2 class="w-4 h-4 text-gray-400 animate-spin" />
				{:else if username.length >= 3}
					{#if isAvailable}
						<Check class="w-4 h-4 text-green-500" />
					{:else if checkError}
						<X class="w-4 h-4 text-red-500" />
					{/if}
				{/if}
			</div>
		</div>
		
		{#if checkError}
			<p class="mt-1 text-xs text-red-600">{checkError}</p>
		{:else if isAvailable}
			<p class="mt-1 text-xs text-green-600">Username available</p>
		{:else}
			<p class="mt-1 text-xs text-gray-500">3-20 characters, letters, numbers, underscores</p>
		{/if}
	</div>
</div>