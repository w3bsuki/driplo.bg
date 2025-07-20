<script lang="ts">
	import { goto } from '$app/navigation'
	import { getAuthContext } from '$lib/stores/auth-context.svelte'
	import CreateListingForm from '$lib/components/listings/CreateListingForm.svelte'
	import { onMount } from 'svelte'
	import * as m from '$lib/paraglide/messages.js'
	import { page } from '$app/stores'
	
	// Get auth context
	const authContext = getAuthContext()
	
	onMount(() => {
		// Check auth on mount only
		if (!authContext?.user) {
			goto('/login?redirect=/sell')
		}
	})
</script>

<svelte:head>
	<title>{m.sell_page_title()}</title>
	<meta name="description" content={m.sell_page_description()} />
</svelte:head>

{#if authContext?.user}
	<CreateListingForm supabase={$page.data.supabase} />
{:else}
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<div class="text-center">
			<h2 class="text-xl font-semibold mb-2">{m.sell_login_required()}</h2>
			<p class="text-gray-600">{m.sell_need_account()}</p>
		</div>
	</div>
{/if}