<template>
  <div class="min-h-screen flex flex-col">
    <nav class="border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div class="mx-auto flex  items-center gap-1">
        <NuxtLink to="/" class="rounded px-3 py-2 text-sm font-medium transition-colors"
          :class="isHome ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'">
          Product
        </NuxtLink>
        <NuxtLink to="/categories" class="rounded px-3 py-2 text-sm font-medium transition-colors"
          :class="isCategories ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'">
          Category
        </NuxtLink>
      </div>
    </nav>
    <main class="flex-1">
      <Toast />
      <ConfirmDialog />
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
const isCategories = computed(() => route.path === '/categories')
</script>
