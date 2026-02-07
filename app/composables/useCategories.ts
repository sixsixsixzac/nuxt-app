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

  return {
    categories,
    pending,
    error,
    refresh,
  }
}
