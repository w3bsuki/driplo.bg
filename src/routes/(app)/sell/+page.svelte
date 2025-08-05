<script lang="ts">
	import { goto } from '$app/navigation'
	import { user } from '$lib/stores/auth'
	import ProductionListingForm from '$lib/components/listings/ProductionListingForm.svelte'
	import { onMount } from 'svelte'
	import * as m from '$lib/paraglide/messages.js'
	import { Lock } from 'lucide-svelte'
	import { Button } from '$lib/components/native'
	import type { PageData } from './$types'
	
	let { data }: { data: PageData } = $props()
	
	onMount(() => {
		if (!$user) {
			goto('/login?redirect=/sell')
		}
	})
</script>

<svelte:head>
	<title>{m.sell_page_title()}</title>
	<meta name="description" content={m.sell_page_description()} />
</svelte:head>

{#if $user && data.user}
	<div class="min-h-screen bg-gray-50 py-4">
		<ProductionListingForm 
			form={data.form} 
			categories={data.categories} 
			hasPaymentAccount={data.hasPaymentAccount} 
		/>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<div class="text-center space-y-4 px-4">
			<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
				<Lock class="w-8 h-8 text-blue-600" />
			</div>
			<div class="space-y-2">
				<h2 class="text-xl font-semibold">{m.sell_login_required()}</h2>
				<p class="text-gray-600">{m.sell_need_account()}</p>
			</div>
			<a href="/login?redirect=/sell">
				<Button>
					Sign in to continue
				</Button>
			</a>
		</div>
	</div>
{/if}