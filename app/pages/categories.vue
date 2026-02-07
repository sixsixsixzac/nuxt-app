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

    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Delete category"
      modal
      :style="{ width: '28rem' }"
      :closable="true"
      @hide="categoryToDelete = null"
    >
      <p v-if="categoryToDelete" class="mb-4">
        Are you sure you want to delete "{{ formatCategoryName(categoryToDelete.name) }}"?
      </p>
      <div v-if="categoryToDelete?.items && categoryToDelete.items > 0" class="mb-4">
        <label for="transfer-category" class="mb-2 block text-sm font-medium text-gray-700">
          Transfer {{ categoryToDelete.items }} product(s) to
        </label>
        <Select
          id="transfer-category"
          v-model="transferToCategoryId"
          :options="transferCategoryOptions"
          option-label="label"
          option-value="id"
          placeholder="Select category"
          class="w-full"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="deleteDialogVisible = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            @click="confirmDelete"
          >
            Delete
          </button>
        </div>
      </template>
    </Dialog>

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
import { useCategoryProvider } from '../composables/useCategories'

const toast = useToast()

const PAGE_SIZE = 10
const currentPage = ref(1)

const { categories: allCategories, total, pending, error, prependCategory, replaceCategory, removeCategory } = useCategoryProvider()

const categories = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return allCategories.value.slice(start, start + PAGE_SIZE)
})

const { totalPages, rangeStart, rangeEnd, pageNumbers } = usePagination({
  pageSize: PAGE_SIZE,
  total: () => total.value,
  currentPage: () => currentPage.value,
})

const formModalVisible = ref(false)
const editingCategory = ref<Category | null>(null)

const deleteDialogVisible = ref(false)
const categoryToDelete = ref<Category | null>(null)
const transferToCategoryId = ref<number | null>(null)

const transferCategoryOptions = computed(() => {
  if (!categoryToDelete.value) return []
  const others = allCategories.value.filter((c) => c.id !== categoryToDelete.value!.id)
  return [
    { id: null, label: 'No category' },
    ...others.map((c) => ({ id: c.id, label: formatCategoryName(c.name) })),
  ]
})

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
  categoryToDelete.value = category
  transferToCategoryId.value = null
  deleteDialogVisible.value = true
}

async function confirmDelete() {
  const category = categoryToDelete.value
  if (!category) return
  const transferToId = transferToCategoryId.value
  try {
    await deleteCategory(category.id, {
      transferToCategoryId: transferToId ?? undefined,
    })
    removeCategory(category.id)
    if (transferToId != null && Number.isInteger(transferToId)) {
      const target = allCategories.value.find((c) => c.id === transferToId)
      if (target) {
        replaceCategory(transferToId, {
          ...target,
          items: target.items + category.items,
        })
      }
    }
    deleteDialogVisible.value = false
    categoryToDelete.value = null
    transferToCategoryId.value = null
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Category has been deleted.',
      life: 3000,
    })
  } catch (e: unknown) {
    const detail =
      (e as { data?: { error?: string } })?.data?.error ??
      (e instanceof Error ? e.message : 'Could not delete category.')
    toast.add({
      severity: 'error',
      summary: 'Delete failed',
      detail,
      life: 5000,
    })
  }
}
</script>
