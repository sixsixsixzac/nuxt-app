<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Products</h1>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <span class="p-input-icon-left w-full md:w-80">
        <i class="pi pi-search" />
        <InputText v-model="searchQuery" placeholder="Search by name or brand…" class="w-full" />
      </span>
      <MultiSelect v-model="selectedCategoryIds" :options="categoryOptions" option-label="label" option-value="id"
        filter placeholder="Filter by category" :max-selected-labels="3" class="w-full md:w-80" />
      <button type="button" class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        :disabled="selectedCategoryIds.length === 0" @click="selectedCategoryIds = []">
        Clear filter
      </button>
      <button type="button" class="ml-auto rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        @click="openAddModal">
        Add product
      </button>
    </div>

    <ProductFormModal v-model:visible="formModalVisible" :product="editingProduct" :categories="categories"
      @submit="onFormSubmit" />

    <div v-if="error" class="text-red-600">{{ error?.message }}</div>
    <ProductsTableSkeleton v-else-if="pending" :rows="PAGE_SIZE" />
    <ProductTable
      v-else
      v-model:current-page="currentPage"
      :products="products"
      :total-pages="totalPages"
      :range-start="rangeStart"
      :range-end="rangeEnd"
      :total="total"
      :page-numbers="pageNumbers"
      @view="onView"
      @edit="onEdit"
      @delete="onDelete"
    />
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
const DEBOUNCE_MS = 300

const searchQuery = ref('')
const debouncedSearch = ref('')
let searchDebounceId: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (value) => {
  if (searchDebounceId) clearTimeout(searchDebounceId)
  searchDebounceId = setTimeout(() => {
    debouncedSearch.value = value
    searchDebounceId = null
  }, DEBOUNCE_MS)
}, { immediate: true })

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
  search: debouncedSearch,
})

watch(selectedCategoryIds, () => { currentPage.value = 1 }, { deep: true })
watch(debouncedSearch, () => { currentPage.value = 1 })

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
