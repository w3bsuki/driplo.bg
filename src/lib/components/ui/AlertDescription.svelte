<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLParagraphElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div
	class={cn('text-sm [&_p]:leading-relaxed', className)}
	{...$$restProps}
>
	<slot />
</div>
</script>