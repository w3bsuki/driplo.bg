# Driplo Component Patterns Guide

This document outlines the recommended component patterns and best practices for the Driplo project.

## 1. Component Structure

### Basic Component Template
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { ComponentProps } from '$lib/types'
  
  // Props with TypeScript
  export let prop1: string
  export let prop2: number = 0
  export let optional: string | undefined = undefined
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    click: { id: string }
    change: { value: string }
  }>()
  
  // Reactive statements
  $: computedValue = prop1 + prop2
  
  // Functions
  function handleClick() {
    dispatch('click', { id: prop1 })
  }
</script>

<div class="component-wrapper">
  <!-- Component content -->
</div>

<style>
  /* Scoped styles if needed */
  .component-wrapper {
    /* Use Tailwind classes in markup instead when possible */
  }
</style>
```

## 2. Data Loading Patterns

### Server-Side Data Loading
```typescript
// +page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
  // Parallel data fetching
  const [listings, categories] = await Promise.all([
    supabase.from('listings').select('*').limit(20),
    supabase.from('categories').select('*')
  ])
  
  if (listings.error) throw error(500, 'Failed to load listings')
  
  return {
    listings: listings.data,
    categories: categories.data
  }
}
```

### Client-Side Data Fetching with TanStack Query
```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { supabase } from '$lib/supabase-client'
  
  const query = createQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .match(filters)
        
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
</script>

{#if $query.isLoading}
  <LoadingSpinner />
{:else if $query.error}
  <ErrorMessage error={$query.error} />
{:else}
  <ListingGrid listings={$query.data} />
{/if}
```

## 3. Form Patterns

### Form with Validation
```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client'
  import { listingSchema } from '$lib/schemas'
  
  export let data
  
  const { form, errors, enhance, submitting } = superForm(data.form, {
    validators: listingSchema,
    errorSelector: '.error',
    scrollToError: 'smooth',
    autoFocusOnError: true
  })
</script>

<form method="POST" use:enhance>
  <div class="form-group">
    <label for="title">Title</label>
    <input
      id="title"
      name="title"
      bind:value={$form.title}
      class:error={$errors.title}
      aria-invalid={$errors.title ? 'true' : undefined}
      aria-describedby={$errors.title ? 'title-error' : undefined}
    />
    {#if $errors.title}
      <span id="title-error" class="error-message">{$errors.title}</span>
    {/if}
  </div>
  
  <button type="submit" disabled={$submitting}>
    {$submitting ? 'Saving...' : 'Save'}
  </button>
</form>
```

## 4. Image Component Pattern

### Unified Image Component
```svelte
<!-- $lib/components/ui/Image.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  
  export let src: string
  export let alt: string
  export let width: number | undefined = undefined
  export let height: number | undefined = undefined
  export let loading: 'lazy' | 'eager' = 'lazy'
  export let sizes: string | undefined = undefined
  export let class: string = ''
  
  let imgElement: HTMLImageElement
  let isIntersecting = false
  let hasError = false
  
  onMount(() => {
    if (loading === 'lazy' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          isIntersecting = entries[0].isIntersecting
        },
        { rootMargin: '50px' }
      )
      
      observer.observe(imgElement)
      
      return () => observer.disconnect()
    } else {
      isIntersecting = true
    }
  })
  
  function handleError() {
    hasError = true
  }
</script>

{#if hasError}
  <div class="bg-gray-200 rounded-lg flex items-center justify-center {class}" 
       style:width={width ? `${width}px` : '100%'}
       style:height={height ? `${height}px` : 'auto'}>
    <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
{:else}
  <img
    bind:this={imgElement}
    src={isIntersecting ? src : undefined}
    {alt}
    {width}
    {height}
    {sizes}
    {loading}
    class={class}
    on:error={handleError}
  />
{/if}
```

## 5. List Component Patterns

### Virtualized List for Performance
```svelte
<script lang="ts">
  import VirtualList from 'svelte-virtual-list'
  
  export let items: any[]
  export let height = '100%'
  export let itemHeight = 100
</script>

<VirtualList {items} {height} {itemHeight} let:item>
  <ListingCard listing={item} />
</VirtualList>
```

### Paginated List
```svelte
<script lang="ts">
  import { page } from '$app/stores'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  
  export let data
  
  $: currentPage = Number($page.url.searchParams.get('page') || 1)
  $: totalPages = Math.ceil(data.total / data.pageSize)
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each data.items as item}
    <ItemCard {item} />
  {/each}
</div>

<Pagination 
  {currentPage} 
  {totalPages}
  baseUrl={$page.url.pathname}
/>
```

## 6. Modal/Dialog Pattern

### Accessible Modal Component
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { trapFocus } from '$lib/actions/trapFocus'
  
  export let open = false
  export let title: string
  
  const dispatch = createEventDispatcher()
  
  function closeModal() {
    open = false
    dispatch('close')
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeModal()
  }
</script>

{#if open}
  <div 
    class="fixed inset-0 z-50 overflow-y-auto"
    on:keydown={handleKeydown}
  >
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50"
      transition:fade={{ duration: 200 }}
      on:click={closeModal}
    />
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative bg-white rounded-lg shadow-xl max-w-md w-full"
        transition:scale={{ duration: 200 }}
        use:trapFocus
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="p-6">
          <h2 id="modal-title" class="text-xl font-semibold mb-4">
            {title}
          </h2>
          
          <slot />
          
          <div class="mt-6 flex gap-3 justify-end">
            <slot name="actions">
              <button 
                type="button"
                class="btn-secondary"
                on:click={closeModal}
              >
                Cancel
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
```

## 7. Store Patterns

### Resource Store Factory
```typescript
// $lib/stores/factory.ts
import { writable, derived } from 'svelte/store'
import type { Readable, Writable } from 'svelte/store'

interface ResourceStore<T> {
  subscribe: Readable<T[]>['subscribe']
  loading: Readable<boolean>
  error: Readable<Error | null>
  load: () => Promise<void>
  create: (item: Partial<T>) => Promise<void>
  update: (id: string, updates: Partial<T>) => Promise<void>
  delete: (id: string) => Promise<void>
  reset: () => void
}

export function createResourceStore<T extends { id: string }>(
  tableName: string,
  options = {}
): ResourceStore<T> {
  const items = writable<T[]>([])
  const loading = writable(false)
  const error = writable<Error | null>(null)
  
  async function load() {
    loading.set(true)
    error.set(null)
    
    try {
      const { data, error: err } = await supabase
        .from(tableName)
        .select('*')
        
      if (err) throw err
      items.set(data)
    } catch (err) {
      error.set(err as Error)
    } finally {
      loading.set(false)
    }
  }
  
  return {
    subscribe: items.subscribe,
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },
    load,
    create: async (item) => { /* ... */ },
    update: async (id, updates) => { /* ... */ },
    delete: async (id) => { /* ... */ },
    reset: () => items.set([])
  }
}
```

## 8. Error Handling Patterns

### Error Boundary Component
```svelte
<!-- $lib/components/ErrorBoundary.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  
  export let fallback: any = null
  export let onError: (error: Error) => void = () => {}
  
  let hasError = false
  let error: Error | null = null
  
  onMount(() => {
    const handleError = (event: ErrorEvent) => {
      hasError = true
      error = event.error
      onError(event.error)
      event.preventDefault()
    }
    
    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  })
</script>

{#if hasError && fallback}
  <svelte:component this={fallback} {error} />
{:else}
  <slot />
{/if}
```

### API Error Handling
```typescript
// $lib/utils/api.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new ApiError(
        error.message || 'Request failed',
        response.status,
        error.code
      )
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Network error', 0)
  }
}
```

## 9. Accessibility Patterns

### Accessible Form Field
```svelte
<script lang="ts">
  import { createUniqueId } from '$lib/utils'
  
  export let label: string
  export let value: string
  export let error: string | undefined = undefined
  export let required = false
  
  const id = createUniqueId()
  const errorId = `${id}-error`
  const helpId = `${id}-help`
</script>

<div class="form-field">
  <label for={id} class="block text-sm font-medium text-gray-700">
    {label}
    {#if required}
      <span class="text-red-500" aria-label="required">*</span>
    {/if}
  </label>
  
  <input
    {id}
    bind:value
    {required}
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? errorId : helpId}
    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm
           focus:border-indigo-500 focus:ring-indigo-500"
    {...$$restProps}
  />
  
  {#if error}
    <p id={errorId} class="mt-2 text-sm text-red-600" role="alert">
      {error}
    </p>
  {:else if $$slots.help}
    <p id={helpId} class="mt-2 text-sm text-gray-500">
      <slot name="help" />
    </p>
  {/if}
</div>
```

## 10. Performance Patterns

### Lazy Loading Components
```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  
  let Component: any
  let isVisible = false
  let container: HTMLElement
  
  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !Component) {
          isVisible = true
          import('./HeavyComponent.svelte').then(module => {
            Component = module.default
          })
        }
      },
      { rootMargin: '100px' }
    )
    
    observer.observe(container)
    
    return () => observer.disconnect()
  })
</script>

<div bind:this={container}>
  {#if Component}
    <svelte:component this={Component} {...$$props} />
  {:else}
    <div class="skeleton-loader h-64" />
  {/if}
</div>
```

### Debounced Search
```svelte
<script lang="ts">
  import { debounce } from '$lib/utils'
  import { createQuery } from '@tanstack/svelte-query'
  
  let searchTerm = ''
  
  const debouncedSearch = debounce((term: string) => {
    searchTerm = term
  }, 300)
  
  $: searchQuery = createQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => searchListings(searchTerm),
    enabled: searchTerm.length > 2
  })
</script>

<input
  type="search"
  placeholder="Search listings..."
  on:input={(e) => debouncedSearch(e.currentTarget.value)}
/>
```

## Component Checklist

When creating a new component, ensure:

- [ ] TypeScript props with proper types
- [ ] Loading and error states handled
- [ ] Mobile responsive design
- [ ] Accessibility attributes (ARIA labels, roles)
- [ ] Keyboard navigation support
- [ ] Proper event handling and cleanup
- [ ] Performance optimizations (lazy loading, memoization)
- [ ] Follows naming conventions
- [ ] Has proper documentation/comments
- [ ] Includes basic tests