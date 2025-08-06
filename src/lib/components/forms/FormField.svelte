<script lang="ts">
	import { cn } from '$lib/utils';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { AlertCircle, Check, Info } from 'lucide-svelte';

	interface Props {
		id: string;
		label: string;
		type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'textarea';
		value?: string | number;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string | null;
		success?: boolean;
		hint?: string;
		maxlength?: number;
		rows?: number;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		inputClass?: string;
		validator?: (value: string) => string | null;
		debounceValidation?: number;
		oninput?: (event: { value: string }) => void;
		onblur?: (event: { value: string }) => void;
		onfocus?: (event: { value: string }) => void;
	}

	let {
		id,
		label,
		type = 'text',
		value = $bindable(''),
		placeholder,
		required = false,
		disabled = false,
		error = $bindable(null),
		success = false,
		hint,
		maxlength,
		rows = 4,
		size = 'md',
		class: className,
		inputClass,
		validator,
		debounceValidation = 300,
		oninput,
		onblur,
		onfocus
	}: Props = $props();

	let validationTimeout: NodeJS.Timeout;
	let isTouched = $state(false);
	let isValidating = $state(false);

	// Reactive validation state
	const hasError = $derived(!!error);
	const hasSuccess = $derived(success && !hasError && isTouched);
	const showValidation = $derived(isTouched && (hasError || hasSuccess));

	// Character count for textarea and inputs with maxlength
	const characterCount = $derived(
		maxlength ? String(value || '').length : 0
	);
	const characterPercentage = $derived(
		maxlength ? (characterCount / maxlength) * 100 : 0
	);

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		const newValue = target.value;
		value = newValue;
		
		oninput?.({ value: newValue });
		
		// Debounced validation
		if (validator && isTouched) {
			isValidating = true;
			clearTimeout(validationTimeout);
			validationTimeout = setTimeout(() => {
				error = validator(newValue);
				isValidating = false;
			}, debounceValidation);
		}
	}

	function handleBlur(event: Event) {
		isTouched = true;
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		const currentValue = target.value;
		
		onblur?.({ value: currentValue });
		
		// Immediate validation on blur
		if (validator) {
			error = validator(currentValue);
		}
	}

	function handleFocus(event: Event) {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		onfocus?.({ value: target.value });
	}

	// Input variant styles based on validation state
	const inputVariant = $derived(() => {
		if (hasError) return 'destructive';
		if (hasSuccess) return 'success';
		return 'default';
	});

	// Dynamic input classes
	const inputClasses = $derived(
		cn(
			// Base validation states
			hasError && 'border-destructive focus-visible:ring-destructive',
			hasSuccess && 'border-success focus-visible:ring-success',
			// Custom classes
			inputClass
		)
	);
</script>

<div class={cn('space-y-2', className)}>
	<!-- Label -->
	<div class="flex items-center justify-between">
		<Label 
			for={id} 
			class={cn(
				'text-sm font-medium',
				hasError ? 'text-destructive' : 'text-foreground'
			)}
		>
			{label}
			{#if required}
				<span class="text-destructive ml-1">*</span>
			{/if}
		</Label>
		
		<!-- Character count for textarea/maxlength inputs -->
		{#if maxlength && (type === 'textarea' || type === 'text')}
			<div class="flex items-center gap-2">
				<!-- Circular progress indicator -->
				<div class="relative w-6 h-6">
					<svg class="w-6 h-6 transform -rotate-90">
						<circle
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="2"
							fill="none"
							class="text-gray-200"
						/>
						<circle
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="2"
							fill="none"
							stroke-dasharray={`${2 * Math.PI * 10}`}
							stroke-dashoffset={`${2 * Math.PI * 10 * (1 - characterPercentage / 100)}`}
							class={cn(
								'transition-all duration-300',
								characterPercentage > 90 ? 'text-warning' : 
								characterPercentage > 75 ? 'text-primary' : 'text-gray-400'
							)}
						/>
					</svg>
					<span class={cn(
						'absolute inset-0 flex items-center justify-center text-xs font-medium',
						characterPercentage > 90 ? 'text-warning' : 'text-gray-600'
					)}>
						{maxlength - characterCount}
					</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input Field -->
	<div class="relative">
		{#if type === 'textarea'}
			<textarea
				{id}
				{placeholder}
				{required}
				{disabled}
				{rows}
				maxlength={maxlength}
				bind:value
				oninput={handleInput}
				onblur={handleBlur}
				onfocus={handleFocus}
				class={cn(
					'flex w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-100 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
					size === 'sm' && 'text-xs py-1.5',
					size === 'lg' && 'py-3 text-base',
					inputClasses
				)}
			></textarea>
		{:else}
			<Input
				{id}
				{type}
				{placeholder}
				{required}
				{disabled}
				{size}
				maxlength={maxlength}
				bind:value
				oninput={handleInput}
				onblur={handleBlur}
				onfocus={handleFocus}
				class={inputClasses}
			/>
		{/if}

		<!-- Validation Icons -->
		{#if showValidation}
			<div class="absolute right-3 top-1/2 -translate-y-1/2">
				{#if isValidating}
					<div class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
				{:else if hasError}
					<AlertCircle class="w-4 h-4 text-destructive" />
				{:else if hasSuccess}
					<Check class="w-4 h-4 text-success" />
				{/if}
			</div>
		{/if}
	</div>

	<!-- Error Message -->
	{#if hasError}
		<div class="flex items-center gap-2 text-sm text-destructive">
			<AlertCircle class="w-4 h-4 flex-shrink-0" />
			<span>{error}</span>
		</div>
	{/if}

	<!-- Hint Message -->
	{#if hint && !hasError}
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<Info class="w-4 h-4 flex-shrink-0" />
			<span>{hint}</span>
		</div>
	{/if}
</div>

<style>
	/* Custom scrollbar for textarea */
	textarea {
		scrollbar-width: thin;
		scrollbar-color: hsl(var(--border)) transparent;
	}
	
	textarea::-webkit-scrollbar {
		width: 6px;
	}
	
	textarea::-webkit-scrollbar-track {
		background: transparent;
	}
	
	textarea::-webkit-scrollbar-thumb {
		background-color: hsl(var(--border));
		border-radius: 3px;
	}
	
	textarea::-webkit-scrollbar-thumb:hover {
		background-color: hsl(var(--muted-foreground));
	}
</style>