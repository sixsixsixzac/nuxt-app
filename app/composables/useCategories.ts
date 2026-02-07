export interface Category {
  id: number
  name: string
  items: number
}

interface CategoriesResponse {
  categories: Category[]
  total: number
  skip: number
  limit: number
}

const CATEGORIES_PROVIDER_KEY = 'categories-provider'
const CATEGORIES_FETCH_LIMIT = 1000

export function useCategoryProvider() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string

  const { data, pending, error, refresh } = useAsyncData(
    CATEGORIES_PROVIDER_KEY,
    () =>
      $fetch<CategoriesResponse>(`${base}/categories`, {
        params: { limit: CATEGORIES_FETCH_LIMIT, skip: 0 },
      }),
  )

  const categories = computed(() => data.value?.categories ?? [])
  const total = computed(() => data.value?.total ?? 0)

  function prependCategory(category: Category) {
    if (data.value) {
      data.value = {
        ...data.value,
        categories: [category, ...data.value.categories],
        total: data.value.total + 1,
      }
    }
  }

  function replaceCategory(id: number, category: Category) {
    if (data.value) {
      data.value = {
        ...data.value,
        categories: data.value.categories.map((c) => (c.id === id ? category : c)),
      }
    }
  }

  function removeCategory(id: number) {
    if (data.value) {
      data.value = {
        ...data.value,
        categories: data.value.categories.filter((c) => c.id !== id),
        total: Math.max(0, data.value.total - 1),
      }
    }
  }

  return {
    categories,
    total,
    pending,
    error,
    refresh,
    prependCategory,
    replaceCategory,
    removeCategory,
  }
}

export async function createCategory(payload: { name: string }): Promise<Category> {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  return $fetch<Category>(`${base}/categories`, {
    method: 'POST',
    body: payload,
  })
}

export async function updateCategory(id: number, payload: { name: string }): Promise<Category> {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  return $fetch<Category>(`${base}/categories/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteCategory(
  id: number,
  options?: { transferToCategoryId?: number | null },
): Promise<void> {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  const transferId = options?.transferToCategoryId
  const query =
    transferId != null && transferId !== null && Number.isInteger(transferId)
      ? { transferToCategoryId: String(transferId) }
      : undefined
  await $fetch(`${base}/categories/${id}`, { method: 'DELETE', query })
}
