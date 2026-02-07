<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
          <td class="px-4 py-3 text-sm text-gray-900">{{ category.id }}</td>
          <td class="px-4 py-3 text-sm text-gray-900">{{ formatCategoryName(category.name) }}</td>
          <td class="px-4 py-3 text-sm text-right text-gray-600">{{ category.items }}</td>
          <td class="px-4 py-3 text-center">
            <div class="flex items-center justify-center gap-2">
              <button type="button"
                class="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                @click="$emit('edit', category)">
                Edit
              </button>
              <button type="button"
                class="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                @click="$emit('delete', category)">
                Delete
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="categories.length === 0" class="px-4 py-8 text-center text-gray-500">
      No categories.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '../composables/useCategories'

defineProps<{
  categories: Category[]
}>()

defineEmits<{
  edit: [category: Category]
  delete: [category: Category]
}>()

function formatCategoryName(name: string) {
  return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
</script>
