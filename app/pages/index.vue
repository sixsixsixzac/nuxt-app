<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Products</h1>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <MultiSelect v-model="selectedCategoryIds" :options="categoryOptions" option-label="label" option-value="id"
        filter placeholder="Filter by category" :max-selected-labels="3" class="w-full md:w-80" />
      <button type="button" class="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        @click="openAddModal">
        Add product
      </button>
    </div>

    <ProductFormModal v-model:visible="formModalVisible" :product="editingProduct" :categories="categories"
      @submit="onFormSubmit" />

    <div v-if="error" class="text-red-600">{{ error?.message }}</div>
    <ProductsTableSkeleton v-else-if="pending" :rows="PAGE_SIZE" />
    <template v-else>
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
                    class="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    @click="onView(product)">
                    View
                  </button>
                  <button type="button"
                    class="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    @click="onEdit(product)">
                    Edit
                  </button>
                  <button type="button"
                    class="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    @click="onDelete(product)">
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
            :disabled="currentPage <= 1" aria-label="Previous page" @click="currentPage--">
            Previous
          </button>
          <template v-for="p in pageNumbers" :key="p">
            <button v-if="p !== '…'" type="button"
              class="min-w-[2.25rem] rounded px-3 py-2 text-sm font-medium transition-colors" :class="p === currentPage
                ? 'bg-emerald-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
              :aria-current="p === currentPage ? 'page' : undefined" @click="currentPage = p">
              {{ p }}
            </button>
            <span v-else class="px-2 py-2 text-gray-400">…</span>
          </template>
          <button type="button"
            class="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
            :disabled="currentPage >= totalPages" aria-label="Next page" @click="currentPage++">
            Next
          </button>
        </nav>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '../composables/useProducts'
import type { ProductFormPayload } from '../composables/useProducts'
import { createProduct, deleteProduct, updateProduct } from '../composables/useProducts'

const confirm = useConfirm()
const toast = useToast()

const formModalVisible = ref(false)
const editingProduct = ref<Product | null>(null)

function openAddModal() {
  editingProduct.value = null
  formModalVisible.value = true
}

function onEdit(product: Product) {
  editingProduct.value = product
  formModalVisible.value = true
}

async function onFormSubmit(payload: ProductFormPayload) {
  try {
    if (payload.id != null) {
      const { id, ...rest } = payload
      const updated = await updateProduct(id, rest)
      replaceProduct(id, updated)
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: `"${payload.title}" has been updated.`,
        life: 3000,
      })
    } else {
      const created = await createProduct(payload)
      prependProduct(created)
      toast.add({
        severity: 'success',
        summary: 'Added',
        detail: `"${payload.title}" has been added.`,
        life: 3000,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: payload.id != null ? 'Update failed' : 'Add failed',
      detail: e instanceof Error ? e.message : 'Something went wrong.',
      life: 5000,
    })
  }
}

const PAGE_SIZE = 10
const selectedCategoryIds = ref<number[]>([])
const currentPage = ref(1)
const skip = computed(() => (currentPage.value - 1) * PAGE_SIZE)

const { categories } = await useCategories()

const categoryOptions = computed(() =>
  categories.value.map((c) => {
    const name = c.name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return {
      ...c,
      label: `${name} (${c.items})`,
    }
  }),
)

const { products, total, pending, error, prependProduct, replaceProduct, removeProduct } = await useProducts({
  limit: PAGE_SIZE,
  skip,
  categoryIds: selectedCategoryIds,
})

watch(selectedCategoryIds, () => { currentPage.value = 1 }, { deep: true })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const rangeStart = computed(() => total.value === 0 ? 0 : (currentPage.value - 1) * PAGE_SIZE + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * PAGE_SIZE, total.value))

const pageNumbers = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const p = currentPage.value
  const pages: (number | '…')[] = []
  pages.push(1)
  if (p > 3) pages.push('…')
  for (let i = Math.max(2, p - 1); i <= Math.min(total - 1, p + 1); i++) {
    if (!pages.includes(i)) pages.push(i)
  }
  if (p < total - 2) pages.push('…')
  if (total > 1) pages.push(total)
  return pages
})

function onView(product: Product) {
  console.log('View', product.id)
}

function onDelete(product: Product) {
  confirm.require({
    message: `Are you sure you want to delete "${product.title}"?`,
    header: 'Delete product',
    rejectProps: { label: 'Cancel', severity: 'secondary' },
    acceptProps: { label: 'Delete', severity: 'danger' },
    accept: async () => {
      try {
        await deleteProduct(product.id)
        removeProduct(product.id)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `"${product.title}" has been deleted.`,
          life: 3000,
        })
      } catch (e) {
        toast.add({
          severity: 'error',
          summary: 'Delete failed',
          detail: e instanceof Error ? e.message : 'Could not delete product.',
          life: 5000,
        })
      }
    },
  })
}
</script>
