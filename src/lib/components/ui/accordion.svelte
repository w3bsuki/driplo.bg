<script lang="ts" context="module">
	import { getContext, setContext } from 'svelte';
	
	const ACCORDION_KEY = Symbol('accordion');
	
	export interface AccordionContext {
		value: string[];
		setValue: (value: string[]) => void;
		type: 'single' | 'multiple';
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { ChevronDown } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	
	interface AccordionProps {
		value?: string | string[];
		type?: 'single' | 'multiple';
		class?: string;
		children?: any;
	}
	
	let { 
		value = [], 
		type = 'single',
		class: className = '',
		children
	}: AccordionProps = $props();
	
	let activeItems = $state(Array.isArray(value) ? value : [value]);
	
	function setValue(newValue: string[]) {
		activeItems = newValue;
	}
	
	setContext(ACCORDION_KEY, {
		get value() { return activeItems; },
		setValue,
		type
	});
</script>

<div class={cn("space-y-1", className)}>
	{@render children?.()}
</div>

<!-- AccordionItem -->
<script lang="ts" context="module">
	export function AccordionItem(props: any) {
		return props;
	}
</script>

<!-- AccordionTrigger -->
<script lang="ts" context="module">
	export function AccordionTrigger(props: {
		value: string;
		class?: string;
		children?: any;
	}) {
		const ctx = getContext<AccordionContext>(ACCORDION_KEY);
		const isOpen = $derived(ctx?.value.includes(props.value));
		
		function toggle() {
			if (!ctx) return;
			
			if (ctx.type === 'single') {
				ctx.setValue(isOpen ? [] : [props.value]);
			} else {
				ctx.setValue(
					isOpen 
						? ctx.value.filter(v => v !== props.value)
						: [...ctx.value, props.value]
				);
			}
		}
		
		return {
			isOpen,
			toggle,
			...props
		};
	}
</script>

<!-- AccordionContent -->
<script lang="ts" context="module">
	export function AccordionContent(props: {
		value: string;
		class?: string;
		children?: any;
	}) {
		const ctx = getContext<AccordionContext>(ACCORDION_KEY);
		const isOpen = $derived(ctx?.value.includes(props.value));
		
		return {
			isOpen,
			...props
		};
	}
</script>