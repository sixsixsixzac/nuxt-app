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
            <td class="px-4 py-3 text-sm text-gray-600">{{ product.category ? formatCategoryName(product.category) : '' }}</td>
            <td class="px-4 py-3 text-sm text-right font-medium">{{ formatPrice(product.price) }}</td>
            <td class="px-4 py-3 text-sm text-right">{{ formatDiscount(product.discountPercentage) }}</td>
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

    <PaginationNav
      :current-page="currentPage"
      :total-pages="totalPages"
      :range-start="rangeStart"
      :range-end="rangeEnd"
      :total="total"
      :page-numbers="pageNumbers"
      @update:current-page="$emit('update:currentPage', $event)"
    />
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
