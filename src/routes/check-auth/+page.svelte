<script lang="ts">
	import { getAuthContext } from '$lib/stores/auth-context.svelte'
	import { onMount } from 'svelte'
	
	const authContext = getAuthContext()
	let sessionInfo = $state<any>(null)
	
	onMount(async () => {
		if (authContext?.supabase) {
			const { data: { session } } = await authContext.supabase.auth.getSession()
			const { data: { user } } = await authContext.supabase.auth.getUser()
			
			sessionInfo = {
				hasSession: !!session,
				hasUser: !!user,
				userEmail: user?.email || 'Not logged in',
				userId: user?.id || 'N/A',
				profile: authContext.profile
			}
		}
	})
</script>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Auth Check</h1>
	
	{#if sessionInfo}
		<pre class="bg-gray-100 p-4 rounded">{JSON.stringify(sessionInfo, null, 2)}</pre>
		
		{#if sessionInfo.hasUser}
			<div class="mt-4">
				<p>Logged in as: <strong>{sessionInfo.userEmail}</strong></p>
				<p>User ID: <code>{sessionInfo.userId}</code></p>
				<p>Is Admin: <strong>{sessionInfo.profile?.is_admin ? 'YES' : 'NO'}</strong></p>
			</div>
		{/if}
	{:else}
		<p>Checking...</p>
	{/if}
</div>