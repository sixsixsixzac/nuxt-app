export interface Product {
  id: number
  title: string
  thumbnail?: string
  brand?: string
  category?: string
  price: number
  discountPercentage?: number
  rating?: number
  stock?: number
}

interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export function useProducts(options: {
  limit: number
  skip: MaybeRefOrGetter<number>
  categoryIds?: MaybeRefOrGetter<number[]>
}) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  const skipRef = computed(() => toValue(options.skip))
  const categoryIdsRef = computed(() => toValue(options.categoryIds ?? []) ?? [])

  const { data, pending, error, refresh } = useAsyncData(
    () => `products-${options.limit}-${skipRef.value}-${categoryIdsRef.value.join(',')}`,
    () =>
      $fetch<ProductsResponse>(`${base}/products`, {
        params: {
          limit: options.limit,
          skip: skipRef.value,
          ...(categoryIdsRef.value.length > 0 ? { categoryId: categoryIdsRef.value } : {}),
        },
      }),
    { watch: [skipRef, categoryIdsRef] },
  )

  const products = computed(() => data.value?.products ?? [])
  const total = computed(() => data.value?.total ?? 0)

  return {
    products,
    total,
    pending,
    error,
    refresh,
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  await $fetch(`${base}/products/${id}`, { method: 'DELETE' })
}
