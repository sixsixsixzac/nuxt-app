<template>
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
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="i in rows" :key="i" class="animate-pulse">
          <td class="px-4 py-3">
            <div class="h-10 w-10 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3">
            <div class="h-4 w-48 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3">
            <div class="h-4 w-20 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3">
            <div class="h-4 w-24 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3 text-right">
            <div class="ml-auto h-4 w-12 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3 text-right">
            <div class="ml-auto h-4 w-8 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3 text-right">
            <div class="ml-auto h-4 w-8 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3 text-right">
            <div class="ml-auto h-4 w-8 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-center gap-2">
              <div class="h-7 w-12 rounded bg-gray-200" />
              <div class="h-7 w-10 rounded bg-gray-200" />
              <div class="h-7 w-14 rounded bg-gray-200" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ rows?: number }>(),
  { rows: 10 },
)
</script>
