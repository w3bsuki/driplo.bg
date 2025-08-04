<script lang="ts">
	import { goto } from '$app/navigation'
	import { getAuthContext } from '$lib/stores/auth-context.svelte'
	import ListingForm from '$lib/components/listings/ListingForm.svelte'
	import { onMount } from 'svelte'
	import * as m from '$lib/paraglide/messages.js'
	import { Lock } from 'lucide-svelte'
	import { Button } from '$lib/components/native'
	import type { PageData } from './$types'
	
	let { data }: { data: PageData } = $props()
	
	const authContext = getAuthContext()
	
	onMount(() => {
		if (!authContext?.user) {
			goto('/login?redirect=/sell')
		}
	})
</script>

<svelte:head>
	<title>{m.sell_page_title()}</title>
	<meta name="description" content={m.sell_page_description()} />
</svelte:head>

{#if authContext?.user && data.user}
	<div class="min-h-screen bg-background">
		<div class="container max-w-4xl py-8">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold mb-2">Create New Listing</h1>
				<p class="text-muted-foreground">
					Fill out the form below to list your item for sale
				</p>
			</div>
			
			<!-- Form -->
			<div class="bg-card rounded-lg border shadow-sm p-6 md:p-8">
				<ListingForm 
					data={data.form} 
					categories={data.categories}
					hasPaymentAccount={data.hasPaymentAccount}
				/>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center bg-background">
		<div class="text-center space-y-4 px-4">
			<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
				<Lock class="w-8 h-8 text-primary" />
			</div>
			<div class="space-y-2">
				<h2 class="text-xl font-semibold">{m.sell_login_required()}</h2>
				<p class="text-muted-foreground">{m.sell_need_account()}</p>
			</div>
			<a href="/login?redirect=/sell">
				<Button>
					Sign in to continue
				</Button>
			</a>
		</div>
	</div>
{/if}