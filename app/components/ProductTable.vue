<template>
  <div>
    <div class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-14 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <img
                v-if="product.thumbnail"
                :src="product.thumbnail"
                :alt="product.title"
                class="h-10 w-10 rounded object-cover"
                @error="(e: Event) => ((e.target as HTMLImageElement).src = '/404.png')"
              />
              <img
                v-else
                src="/404.png"
                :alt="product.title"
                class="h-10 w-10 rounded object-cover"
              />
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">{{ product.title }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ product.brand }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : '' }}</td>
            <td class="px-4 py-3 text-sm text-right font-medium">฿{{ product.price }}</td>
            <td class="px-4 py-3 text-sm text-right">{{ product.discountPercentage != null ?
              product.discountPercentage
              + '%' : '—' }}</td>
            <td class="px-4 py-3 text-sm text-right">{{ product.stock }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button type="button"
                  class="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  @click="$emit('edit', product)">
                  Edit
                </button>
                <button type="button"
                  class="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  @click="$emit('delete', product)">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
            :aria-current="p === currentPage ? 'page' : undefined" @click="$emit('update:currentPage', p)">
            {{ p }}
          </button>
          <span v-else class="px-2 py-2 text-gray-400">…</span>
        </template>
        <button type="button"
          class="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
          :disabled="currentPage >= totalPages" aria-label="Next page" @click="$emit('update:currentPage', currentPage + 1)">
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '../composables/useProducts'

defineProps<{
  products: Product[]
  currentPage: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  total: number
  pageNumbers: (number | '…')[]
}>()

defineEmits<{
  'update:currentPage': [value: number]
  edit: [product: Product]
  delete: [product: Product]
}>()
</script>
