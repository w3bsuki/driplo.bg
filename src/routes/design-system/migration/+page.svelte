<script lang="ts">
  import { onMount } from 'svelte'
  import { migrationStore, migrationStats, generateMigrationReport } from '$lib/design-system/migration'
  import type { ComponentMigration, MigrationStatus } from '$lib/design-system/migration'
  
  let searchQuery = ''
  let filterStatus: MigrationStatus | 'all' = 'all'
  let filterCategory: string | 'all' = 'all'
  
  $: filteredComponents = $migrationStore.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.path.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || component.status === filterStatus
    const matchesCategory = filterCategory === 'all' || component.category === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })
  
  function getStatusColor(status: MigrationStatus): string {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'validated': return 'text-blue-600 bg-blue-50'
      case 'in-progress': return 'text-yellow-600 bg-yellow-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  function getStatusIcon(status: MigrationStatus): string {
    switch (status) {
      case 'completed': return '✓'
      case 'validated': return '✓✓'
      case 'in-progress': return '⏳'
      case 'failed': return '✗'
      default: return '○'
    }
  }
  
  async function downloadReport() {
    const report = generateMigrationReport($migrationStore)
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `migration-report-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold mb-2">Design System Migration Tracker</h1>
    <p class="text-gray-600">Track the progress of migrating components to the modern design system</p>
  </div>
  
  <!-- Stats Overview -->
  <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="text-2xl font-bold">{$migrationStats.total}</div>
      <div class="text-sm text-gray-600">Total Components</div>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <div class="text-2xl font-bold text-green-600">{$migrationStats.completed + $migrationStats.validated}</div>
      <div class="text-sm text-gray-600">Completed</div>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <div class="text-2xl font-bold text-yellow-600">{$migrationStats.inProgress}</div>
      <div class="text-sm text-gray-600">In Progress</div>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <div class="text-2xl font-bold text-gray-600">{$migrationStats.pending}</div>
      <div class="text-sm text-gray-600">Pending</div>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <div class="text-2xl font-bold text-blue-600">{$migrationStats.completionPercentage}%</div>
      <div class="text-sm text-gray-600">Complete</div>
    </div>
  </div>
  
  <!-- Progress Bar -->
  <div class="mb-8">
    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div 
        class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
        style="width: {$migrationStats.completionPercentage}%"
      ></div>
    </div>
  </div>
  
  <!-- Filters -->
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          id="search"
          type="text"
          bind:value={searchQuery}
          placeholder="Search components..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="status"
          bind:value={filterStatus}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="validated">Validated</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          id="category"
          bind:value={filterCategory}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="ui">UI Components</option>
          <option value="layout">Layout</option>
          <option value="feature">Features</option>
          <option value="shared">Shared</option>
        </select>
      </div>
    </div>
  </div>
  
  <!-- Component List -->
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breaking</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each filteredComponents as component}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">{component.name}</div>
                  <div class="text-xs text-gray-500">{component.path}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(component.status)}">
                  <span class="mr-1">{getStatusIcon(component.status)}</span>
                  {component.status}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {#if component.oldSpecs.height && component.newSpecs.height}
                  <div>Height: {component.oldSpecs.height} → {component.newSpecs.height}</div>
                {/if}
                {#if component.oldSpecs.touchTarget && component.newSpecs.touchTarget}
                  <div>Touch: {component.oldSpecs.touchTarget} → {component.newSpecs.touchTarget}</div>
                {/if}
                {#if component.oldSpecs.padding && component.newSpecs.padding}
                  <div>Padding: {component.oldSpecs.padding} → {component.newSpecs.padding}</div>
                {/if}
              </td>
              <td class="px-6 py-4">
                {#if component.breaking}
                  <span class="text-red-600 font-semibold">Yes</span>
                {:else}
                  <span class="text-green-600">No</span>
                {/if}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {component.notes || '-'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Actions -->
  <div class="mt-6 flex justify-end">
    <button
      on:click={downloadReport}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Download Report
    </button>
  </div>
</div>