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
        <tr v-for="i in rows" :key="i" class="animate-pulse">
          <td class="px-4 py-3">
            <div class="h-4 w-8 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3">
            <div class="h-4 w-32 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3 text-right">
            <div class="ml-auto h-4 w-8 rounded bg-gray-200" />
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-center gap-2">
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
