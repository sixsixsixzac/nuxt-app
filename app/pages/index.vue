<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Products</h1>
    <div v-if="pending" class="text-gray-500">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error.message }}</div>
    <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-900">{{ product.title }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ product.brand }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ product.category }}</td>
            <td class="px-4 py-3 text-sm text-right font-medium">${{ product.price }}</td>
            <td class="px-4 py-3 text-sm text-right">{{ product.rating }}</td>
            <td class="px-4 py-3 text-sm text-right">{{ product.stock }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { data, pending, error } = await useFetch<{
  products: Array<{
    id: number
    title: string
    brand: string
    category: string
    price: number
    rating: number
    stock: number
  }>
}>(`${config.public.apiBase}/products`)

const products = computed(() => data.value?.products ?? [])
</script>
