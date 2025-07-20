<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		[key: string]: any;
	}

	let {
		class: className,
		...restProps
	}: Props = $props();
</script>

<SelectPrimitive.Separator
	class={cn('-mx-1 my-1 h-px bg-muted', className)}
	{...restProps}
/>