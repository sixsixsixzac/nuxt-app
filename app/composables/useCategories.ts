export interface Category {
  id: number
  name: string
  items: number
}

export function useCategories() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string

  const { data, pending, error, refresh } = useAsyncData('categories', () =>
    $fetch<Category[]>(`${base}/categories`),
  )

  const categories = computed(() => data.value ?? [])

  function prependCategory(category: Category) {
    if (data.value) {
      data.value = [category, ...data.value]
    }
  }

  function replaceCategory(id: number, category: Category) {
    if (data.value) {
      data.value = data.value.map((c) => (c.id === id ? category : c))
    }
  }

  function removeCategory(id: number) {
    if (data.value) {
      data.value = data.value.filter((c) => c.id !== id)
    }
  }

  return {
    categories,
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
