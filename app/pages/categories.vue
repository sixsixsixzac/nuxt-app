<template>
  <div class="p-6">
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-semibold">Category</h1>
      <button type="button" class="ml-auto rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        @click="openAddModal">
        Add
      </button>
    </div>

    <CategoryFormModal v-model:visible="formModalVisible" :category="editingCategory" @submit="onFormSubmit" />

    <div v-if="error" class="text-red-600">{{ error?.message }}</div>
    <CategoryTableSkeleton v-else-if="pending" :rows="PAGE_SIZE" />
    <CategoryTable
      v-else
      v-model:current-page="currentPage"
      :categories="categories"
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
import type { Category } from '../composables/useCategories'
import { createCategory, deleteCategory, updateCategory } from '../composables/useCategories'

const confirm = useConfirm()
const toast = useToast()

const PAGE_SIZE = 10
const currentPage = ref(1)
const skip = computed(() => (currentPage.value - 1) * PAGE_SIZE)

const { categories, total, pending, error, prependCategory, replaceCategory, removeCategory } = await useCategories({
  limit: PAGE_SIZE,
  skip,
})

const { totalPages, rangeStart, rangeEnd, pageNumbers } = usePagination({
  pageSize: PAGE_SIZE,
  total: () => total.value,
  currentPage: () => currentPage.value,
})

const formModalVisible = ref(false)
const editingCategory = ref<Category | null>(null)

function onView(category: Category) {
  navigateTo({ path: '/', query: { categoryId: String(category.id) } })
}

function openAddModal() {
  editingCategory.value = null
  formModalVisible.value = true
}

function onEdit(category: Category) {
  editingCategory.value = category
  formModalVisible.value = true
}

async function onFormSubmit(payload: { id?: number; name: string }) {
  try {
    if (payload.id != null) {
      const updated = await updateCategory(payload.id, { name: payload.name })
      replaceCategory(payload.id, updated)
      formModalVisible.value = false
      editingCategory.value = null
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: `Category has been updated.`,
        life: 3000,
      })
    } else {
      const created = await createCategory({ name: payload.name })
      prependCategory(created)
      formModalVisible.value = false
      toast.add({
        severity: 'success',
        summary: 'Added',
        detail: `Category has been added.`,
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

function onDelete(category: Category) {
  const displayName = formatCategoryName(category.name)
  confirm.require({
    message: `Are you sure you want to delete "${displayName}"?`,
    header: 'Delete category',
    rejectProps: { label: 'Cancel', severity: 'secondary' },
    acceptProps: { label: 'Delete', severity: 'danger' },
    accept: async () => {
      try {
        await deleteCategory(category.id)
        removeCategory(category.id)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Category has been deleted.',
          life: 3000,
        })
      } catch (e) {
        toast.add({
          severity: 'error',
          summary: 'Delete failed',
          detail: e instanceof Error ? e.message : 'Could not delete category.',
          life: 5000,
        })
      }
    },
  })
}
</script>
