<script lang="ts">
	import { goto } from '$app/navigation';
	import { User } from 'lucide-svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getAuthContext } from '$lib/stores/auth-context.svelte';
	
	interface Props {
		authContext: ReturnType<typeof getAuthContext>;
		brandSlug?: string | null;
		onSignOut: () => void;
	}
	
	let { authContext, brandSlug = null, onSignOut }: Props = $props();
	
	function navigateTo(path: string) {
		goto(path);
	}
</script>

{#if authContext?.user}
	<!-- Compact Profile Header -->
	<div class="px-2 py-2 mb-2">
		<button
			onclick={() => navigateTo(authContext.profile?.username ? `/profile/${authContext.profile.username}` : '/profile')}
			class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
		>
			<img 
				src={authContext.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authContext.profile?.username || authContext.user.email}`} 
				alt="Profile" 
				class="h-12 w-12 rounded-xl object-cover" 
			/>
			<div class="flex-1 text-left">
				<p class="font-semibold text-foreground">{authContext.profile?.full_name || authContext.profile?.username || 'My Profile'}</p>
				<p class="text-xs text-muted-foreground">@{authContext.profile?.username || 'user'}</p>
			</div>
		</button>
	</div>

	<!-- Quick Actions Grid -->
	<div class="grid grid-cols-2 gap-2 mb-3">
		<button
			onclick={() => navigateTo('/orders?type=bought')}
			class="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
		>
			<span class="text-lg">🛒</span>
			<span class="text-xs text-foreground">Bought</span>
		</button>
		
		<button
			onclick={() => navigateTo('/orders?type=sold')}
			class="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
		>
			<span class="text-lg">💰</span>
			<span class="text-xs text-foreground">Sold</span>
		</button>
	</div>

	<div class="border-t border-border pt-2 space-y-1">
		<!-- Admin Dashboard -->
		{#if authContext.profile?.is_admin}
			<button
				onclick={() => navigateTo('/admin')}
				class="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-colors text-left"
			>
				<span class="text-lg">👑</span>
				<span class="text-sm font-medium text-purple-700">Admin Dashboard</span>
			</button>
		{/if}
		
		<!-- Settings -->
		<button
			onclick={() => navigateTo('/profile/settings')}
			class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
		>
			<span class="text-lg">⚙️</span>
			<span class="text-sm text-foreground">{m.header_settings()}</span>
		</button>
		
		<!-- Brand Profile & Analytics (for brand accounts) -->
		{#if authContext.profile?.account_type === 'brand' && brandSlug}
			<button
				onclick={() => navigateTo(`/brands/${brandSlug}`)}
				class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
			>
				<span class="text-lg">🏪</span>
				<span class="text-sm text-foreground">View Brand Profile</span>
			</button>
			<button
				onclick={() => navigateTo('/brands/analytics')}
				class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
			>
				<span class="text-lg">📊</span>
				<span class="text-sm text-foreground">Brand Analytics</span>
			</button>
		{/if}
		
		<!-- Brand Settings -->
		<button
			onclick={() => navigateTo('/brands/settings')}
			class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
		>
			<span class="text-lg">🏪</span>
			<span class="text-sm text-foreground">
				{authContext.profile?.account_type === 'brand' ? 'Brand Settings' : 'Upgrade to Brand'}
			</span>
			{#if authContext.profile?.is_verified}
				<span class="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
			{/if}
		</button>
		
		<!-- Language -->
		<div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted">
			<div class="flex items-center gap-3">
				<span class="text-lg">🌐</span>
				<span class="text-sm text-foreground">Language</span>
			</div>
			<LanguageSwitcher />
		</div>
		
		<!-- Sign Out -->
		<button
			onclick={onSignOut}
			class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
		>
			<span class="text-lg">🚪</span>
			<span class="text-sm font-medium">Sign out</span>
		</button>
	</div>
{:else}
	<!-- Not logged in state -->
	<div class="p-4 text-center">
		<div class="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
			<User class="h-8 w-8 text-muted-foreground" />
		</div>
		<p class="text-sm text-muted-foreground mb-4">Sign in to access your account</p>
		<button
			onclick={() => navigateTo('/login')}
			class="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
		>
			{m.header_sign_in()}
		</button>
		<button
			onclick={() => navigateTo('/register')}
			class="w-full mt-2 px-4 py-2.5 border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors"
		>
			Create account
		</button>
	</div>
	
	<!-- Language at bottom when not logged in -->
	<div class="border-t border-border pt-2 mt-4">
		<div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted">
			<div class="flex items-center gap-3">
				<span class="text-lg">🌐</span>
				<span class="text-sm text-foreground">Language</span>
			</div>
			<LanguageSwitcher />
		</div>
	</div>
{/if}