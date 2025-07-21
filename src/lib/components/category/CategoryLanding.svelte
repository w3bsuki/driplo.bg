<script lang="ts">
  import type { Category } from '$lib/types';
  import HeroSearch from '$lib/components/home/HeroSearch.svelte';
  import ListingGrid from '$lib/components/listings/ListingGrid.svelte';
  import ReusableFilters from '$lib/components/shared/ReusableFilters.svelte';
  import { cn } from '$lib/utils';
  import { ChevronRight } from 'lucide-svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from '$lib/types/database';
  import { getFiltersForCategory } from '$lib/config/categoryFilters';
  
  interface Props {
    category: Category;
    subcategories: Category[];
    products?: any[];
    topSellers?: any[];
    supabase?: SupabaseClient<Database>;
    theme?: 'blue' | 'pink';
  }
  
  let { category, subcategories, products = [], topSellers = [], supabase, theme = 'blue' }: Props = $props();
  
  // State for filtering
  let selectedSubcategory = $state('all');
  let searchQuery = $state('');
  let sortBy = $state('newest');
  
  // Get dynamic filters based on category
  const filterGroups = $derived(getFiltersForCategory(category.slug));
  
  // Selected filters state - dynamic based on filter types
  const selectedFilters = $state<Record<string, string | string[]>>({});
  
  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First', field: 'created_at', order: 'desc' as const },
    { value: 'price-low', label: 'Price: Low to High', field: 'price', order: 'asc' as const },
    { value: 'price-high', label: 'Price: High to Low', field: 'price', order: 'desc' as const },
    { value: 'popular', label: 'Most Popular', field: 'favorites_count', order: 'desc' as const },
    { value: 'rating', label: 'Best Rated', field: 'seller_rating', order: 'desc' as const }
  ];
  
  // Filtered products
  const filteredProducts = $derived(() => {
    let filtered = products;
    
    // Subcategory filter
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(p => p.subcategory_id === selectedSubcategory);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }
    
    // Apply all dynamic filters
    Object.entries(selectedFilters).forEach(([filterType, filterValue]) => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return;
      
      switch (filterType) {
        case 'price':
          if (typeof filterValue === 'string') {
            const [min, max] = filterValue.split('-').map(Number);
            filtered = filtered.filter(p => {
              if (max) {
                return p.price >= min && p.price <= max;
              } else {
                return p.price >= min;
              }
            });
          }
          break;
          
        case 'size':
          if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.size));
          }
          break;
          
        case 'color':
          if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.color));
          }
          break;
          
        case 'brand':
          if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.brand?.toLowerCase().replace(/\s+/g, '-')));
          }
          break;
          
        case 'condition':
          if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.condition));
          }
          break;
          
        case 'style':
          if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.style));
          }
          break;
          
        case 'material':
          if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.material));
          }
          break;
          
        case 'type':
          if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.type));
          }
          break;
      }
    });
    
    // Apply sorting
    const currentSort = sortOptions.find(s => s.value === sortBy);
    if (currentSort) {
      filtered = filtered.sort((a, b) => {
        const aVal = a[currentSort.field] || 0;
        const bVal = b[currentSort.field] || 0;
        return currentSort.order === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    
    return filtered;
  });
  
  function handleFilterChange(type: string, value: string | string[]) {
    selectedFilters[type] = value;
  }
  
  function handleSubcategoryChange(subcategory: string) {
    selectedSubcategory = subcategory;
  }
  
  function clearFilters() {
    selectedSubcategory = 'all';
    Object.keys(selectedFilters).forEach(key => {
      selectedFilters[key] = Array.isArray(selectedFilters[key]) ? [] : '';
    });
    searchQuery = '';
    sortBy = 'newest';
  }
  
  const hasActiveFilters = $derived(() => {
    if (selectedSubcategory !== 'all' || searchQuery !== '') return true;
    
    return Object.entries(selectedFilters).some(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '';
    });
  });
</script>


<!-- Hero Section with Top Sellers and Search -->
<section class={cn(
  "relative py-6 md:py-8",
  theme === 'pink' ? "bg-gradient-to-b from-pink-50 to-white" : "bg-gradient-to-b from-blue-50 to-white"
)}>
  <div class="container px-4">
    <div class="max-w-3xl mx-auto">
      
      <!-- Top Sellers Section -->
      {#if topSellers.length > 0}
        <div class="mb-6">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
            <span>🏆</span>
            <span>Top Sellers in {category.name}</span>
          </h2>
          <div class="flex justify-center gap-6 md:gap-8">
            {#each topSellers.slice(0, 3) as seller, index}
              <a href="/profile/{seller.username}" class="text-center group">
                <div class="relative">
                  {#if index === 0}
                    <div class="absolute -top-2 -right-2 text-lg">👑</div>
                  {/if}
                  <div class="relative">
                    <div class={cn(
                      "absolute inset-0 rounded-full blur opacity-20 group-hover:opacity-30 transition-all duration-300",
                      theme === 'pink' ? "bg-gradient-to-r from-pink-400 to-pink-600" : "bg-gradient-to-r from-blue-400 to-blue-600"
                    )}></div>
                    <div class={cn(
                      "relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-3 ring-white shadow-lg transition-all duration-300",
                      theme === 'pink' ? "group-hover:ring-pink-200" : "group-hover:ring-blue-200"
                    )}>
                      {#if seller.avatar_url}
                        <img src={seller.avatar_url} alt={seller.username} class="w-full h-full object-cover" />
                      {:else}
                        <div class={cn(
                          "w-full h-full flex items-center justify-center",
                          theme === 'pink' ? "bg-gradient-to-br from-pink-400 to-pink-600" : "bg-gradient-to-br from-blue-400 to-blue-600"
                        )}>
                          <span class="text-white font-bold text-lg md:text-xl">{seller.username.split('_')[0][0].toUpperCase()}</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
                <div class="mt-2">
                  <p class="text-sm md:text-base font-medium text-gray-800">{seller.username.split('_')[0]}</p>
                  <div class="flex items-center justify-center gap-1 text-xs md:text-sm text-gray-600">
                    <span>⭐</span>
                    <span>{seller.category_rating?.toFixed(1) || '4.8'}</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{seller.category_sales || 25} sales</p>
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- Search Bar -->
      <div class="relative group">
        <div class={cn(
          "absolute inset-0 rounded-2xl blur-xl opacity-20 transition-all duration-300 group-focus-within:opacity-30 group-focus-within:blur-2xl",
          theme === 'pink' ? "bg-gradient-to-r from-pink-400 to-pink-600" : "bg-gradient-to-r from-blue-400 to-blue-600"
        )}></div>
        
        <div class="relative bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div class="flex items-center">
            <div class="pl-6 pr-3">
              <span class="text-lg">🔍</span>
            </div>
            
            <input
              type="search"
              placeholder="Search {category.name.toLowerCase()} fashion..."
              bind:value={searchQuery}
              class="flex-1 py-3 md:py-3.5 pr-4 text-sm md:text-base placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
            
            <button
              onclick={() => {}}
              class={cn(
                "mr-2 px-4 md:px-5 py-2 text-white font-medium rounded-lg text-sm md:text-base transition-all duration-200 active:scale-95",
                theme === 'pink' 
                  ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700" 
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              )}
            >
              Search
            </button>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</section>

<!-- Category Filters -->
<ReusableFilters 
  filters={filterGroups}
  {selectedFilters}
  {subcategories}
  showSubcategories={true}
  {selectedSubcategory}
  onFilterChange={handleFilterChange}
  onSubcategoryChange={handleSubcategoryChange}
  onClearFilters={clearFilters}
  {theme}
/>

<!-- Sort Bar -->
<div class="bg-white border-b">
  <div class="container mx-auto px-4 py-3">
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600">
        {hasActiveFilters() ? `${filteredProducts().length} results` : `${products.length} products`}
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Sort by:</span>
        <div class="relative">
          <select
            bind:value={sortBy}
            class="w-full text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200 font-medium text-gray-700"
            style="appearance: none; -webkit-appearance: none; -moz-appearance: none;"
          >
            {#each sortOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          <!-- Chevron Icon -->
          <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Products Grid -->
<div class="container mx-auto px-4 py-8">
  {#if filteredProducts().length > 0}
    <ListingGrid 
      listings={filteredProducts()}
      showLoading={false}
      {supabase}
    />
  {:else}
    <div class="text-center py-12">
      <p class="text-gray-500 text-lg mb-4">No items found</p>
      {#if hasActiveFilters}
        <button
          onclick={clearFilters}
          class="text-primary hover:text-primary/80 font-medium"
        >
          Clear filters and show all
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Custom select styling */
  select {
    background-image: none;
  }
  
  /* Remove default arrow in IE */
  select::-ms-expand {
    display: none;
  }
</style>