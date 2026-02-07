<template>
  <div v-if="totalPages > 1"
    class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
    <p class="text-sm text-gray-600">
      Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }}
    </p>
    <nav class="flex items-center gap-1" aria-label="Pagination">
      <button type="button"
        class="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
        :disabled="currentPage <= 1" aria-label="Previous page" @click="$emit('update:currentPage', currentPage - 1)">
        Previous
      </button>
      <template v-for="p in pageNumbers" :key="String(p)">
        <button v-if="p !== '…'" type="button"
          class="min-w-[2.25rem] rounded px-3 py-2 text-sm font-medium transition-colors" :class="p === currentPage
              ? 'bg-emerald-600 text-white'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            " :aria-current="p === currentPage ? 'page' : undefined" @click="$emit('update:currentPage', p)">
          {{ p }}
        </button>
        <span v-else class="px-2 py-2 text-gray-400">…</span>
      </template>
      <button type="button"
        class="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
        :disabled="currentPage >= totalPages" aria-label="Next page"
        @click="$emit('update:currentPage', currentPage + 1)">
        Next
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  total: number
  pageNumbers: (number | '…')[]
}>()

defineEmits<{
  'update:currentPage': [value: number]
}>()
</script>
