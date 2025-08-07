<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import { Ruler } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Props {
		size: string;
		badgeSize?: 'sm' | 'md' | 'lg';
		variant?: 'default' | 'compact';
		class?: string;
	}
	
	let { size, badgeSize = 'sm', variant = 'default', class: className }: Props = $props();
</script>

<Badge variant="outline" size={badgeSize} class={className}>
	<Ruler class="w-3 h-3 mr-1" />
	{m.size_label()} {size}
</Badge>