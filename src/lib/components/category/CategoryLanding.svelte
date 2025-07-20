<script lang="ts">
  import type { Category } from '$lib/types';
  import HeroSearch from '$lib/components/home/HeroSearch.svelte';
  import ListingGrid from '$lib/components/listings/ListingGrid.svelte';
  import ReusableFilters from '$lib/components/shared/ReusableFilters.svelte';
  import { cn } from '$lib/utils';
  import { ChevronRight } from 'lucide-svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from '$lib/types/database';
  
  interface Props {
    category: Category;
    subcategories: Category[];
    products?: any[];
    topSellers?: any[];
    supabase?: SupabaseClient<Database>;
  }
  
  let { category, subcategories, products = [], topSellers = [], supabase }: Props = $props();
  
  // State for filtering
  let selectedSubcategory = $state('all');
  let selectedSizes = $state<string[]>([]);
  let selectedConditions = $state<string[]>([]);
  let selectedPriceRange = $state('');
  let searchQuery = $state('');
  
  // Filter configuration for category pages
  const filterGroups = [
    {
      type: 'price',
      label: 'Price',
      options: [
        { value: '0-20', label: 'Under $20' },
        { value: '20-50', label: '$20-$50' },
        { value: '50-100', label: '$50-$100' },
        { value: '100-', label: '$100+' }
      ]
    },
    {
      type: 'size',
      label: 'Size',
      options: [
        { value: 'XS', label: 'XS' },
        { value: 'S', label: 'S' },
        { value: 'M', label: 'M' },
        { value: 'L', label: 'L' },
        { value: 'XL', label: 'XL' },
        { value: 'XXL', label: 'XXL' }
      ]
    },
    {
      type: 'condition',
      label: 'Condition',
      options: [
        { value: 'new', label: 'New with tags' },
        { value: 'likenew', label: 'Like new' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' }
      ]
    }
  ];
  
  // Selected filters state
  const selectedFilters = $state({
    price: '',
    size: [],
    condition: []
  });
  
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
    
    // Size filter
    if (selectedFilters.size.length > 0) {
      filtered = filtered.filter(p => selectedFilters.size.includes(p.size));
    }
    
    // Condition filter
    if (selectedFilters.condition.length > 0) {
      filtered = filtered.filter(p => selectedFilters.condition.includes(p.condition));
    }
    
    // Price filter
    if (selectedFilters.price) {
      const [min, max] = selectedFilters.price.split('-').map(Number);
      filtered = filtered.filter(p => {
        if (max) {
          return p.price >= min && p.price <= max;
        } else {
          return p.price >= min;
        }
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
    selectedFilters.price = '';
    selectedFilters.size = [];
    selectedFilters.condition = [];
    searchQuery = '';
  }
  
  const hasActiveFilters = $derived(
    selectedSubcategory !== 'all' ||
    selectedFilters.size.length > 0 ||
    selectedFilters.condition.length > 0 ||
    selectedFilters.price !== '' ||
    searchQuery !== ''
  );
</script>

<!-- Hero Section with Top Sellers and Search -->
<section class="relative bg-gradient-to-b from-blue-50 to-white py-6 md:py-8">
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
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                    <div class="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-3 ring-white shadow-lg group-hover:ring-blue-200 transition-all duration-300">
                      {#if seller.avatar_url}
                        <img src={seller.avatar_url} alt={seller.username} class="w-full h-full object-cover" />
                      {:else}
                        <div class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
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
        <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-xl opacity-20 transition-all duration-300 group-focus-within:opacity-30 group-focus-within:blur-2xl"></div>
        
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
              class="mr-2 px-4 md:px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg text-sm md:text-base hover:from-blue-600 hover:to-blue-700 transition-all duration-200 active:scale-95"
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
/>

<!-- Products Grid -->
<div class="container mx-auto px-4 py-8">
  {#if filteredProducts().length > 0}
    <div class="mb-4 text-sm text-gray-600">
      {filteredProducts().length} items found
    </div>
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
</style>