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

export function useCategories(options: {
  limit: number
  skip: MaybeRefOrGetter<number>
}) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  const skipRef = computed(() => toValue(options.skip))

  const { data, pending, error, refresh } = useAsyncData(
    () => `categories-${options.limit}-${skipRef.value}`,
    () =>
      $fetch<CategoriesResponse>(`${base}/categories`, {
        params: {
          limit: options.limit,
          skip: skipRef.value,
        },
      }),
    { watch: [skipRef] },
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

export async function deleteCategory(id: number): Promise<void> {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  await $fetch(`${base}/categories/${id}`, { method: 'DELETE' })
}
